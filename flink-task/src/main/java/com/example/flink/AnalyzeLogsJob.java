package com.example.flink;

import com.example.flink.models.Alarm;
import com.example.flink.models.CassandraVesselInfo;
import com.example.flink.models.VesselTracking;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.flink.api.common.eventtime.WatermarkStrategy;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.api.common.state.ValueState;
import org.apache.flink.api.common.state.ValueStateDescriptor;
import org.apache.flink.api.java.functions.KeySelector;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.connector.kafka.source.KafkaSource;
import org.apache.flink.connector.kafka.source.enumerator.initializer.OffsetsInitializer;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.datastream.SingleOutputStreamOperator;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.KeyedProcessFunction;
import org.apache.flink.util.Collector;

import java.time.OffsetDateTime;
import java.time.Duration;
import java.time.format.DateTimeParseException;
import java.util.Properties;
import java.util.UUID;

import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;


/**
 * AnalyzeLogsJob reads logs from the Kafka "vts" and "sat" topic, partitions them by MMSI using keyBy,
 * updates or creates a VesselTracking state (using a fault–tolerant ValueState),
 * and emits new vessel events (as CassandraVesselInfo objects) via a side output.
 */
public class AnalyzeLogsJob {

    public static void main(String[] args) throws Exception {
        // 1. Set up the execution environment.
        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        // 2) Build a Kafka source to consume messages from the 'vts' topic
        KafkaSource<String> kafkaSourceVts = KafkaSource.<String>builder()
                .setBootstrapServers("kafka.kafka.svc.cluster.local:9092")
                .setTopics("vts")
                .setGroupId("flink-vts-consumer-group")
                .setStartingOffsets(OffsetsInitializer.earliest())
                .setValueOnlyDeserializer(new SimpleStringSchema())
                .build();

        //Build a Kafka source to consume messages from the 'sat' topic
        KafkaSource<String> kafkaSourceSat = KafkaSource.<String>builder()
                .setBootstrapServers("kafka.kafka.svc.cluster.local:9092")
                .setTopics("sat")
                .setGroupId("flink-sat-consumer-group")
                .setStartingOffsets(OffsetsInitializer.earliest())
                .setValueOnlyDeserializer(new SimpleStringSchema())
                .build();

        // Create data streams from the Kafka sources
        DataStream<String> vtsStream = env.fromSource(kafkaSourceVts, WatermarkStrategy.noWatermarks(), "KafkaSourceVts");
        DataStream<String> satStream = env.fromSource(kafkaSourceSat, WatermarkStrategy.noWatermarks(), "KafkaSourceSat");

        // Unite the two streams
        DataStream<String> unifiedStream = vtsStream.union(satStream);

        // 3. Partitioning the stream by MMSI.
        SingleOutputStreamOperator<VesselTracking> vesselTrackingStream = unifiedStream
                .keyBy(new MmsiKeySelector())
                .process(new VesselTrackingProcessFunction());

        // 4. For demonstration, print the vessel tracking output.
        vesselTrackingStream.print("Vessel Tracking");

        // 5. Execute the job.
        env.execute("Fetchign logs from Kafka Job");
    }

    /**
     * A KeySelector to extract the MMSI value from the JSON log.
     */
    public static class MmsiKeySelector implements KeySelector<String, Long> {
        private static final ObjectMapper mapper = new ObjectMapper();

        @Override
        public Long getKey(String value) throws Exception {
            JsonNode node = mapper.readTree(value);
            return node.get("MMSI").asLong();
        }
    }

    /**
     * A KeyedProcessFunction that uses a ValueState to track VesselTracking per MMSI.
     *
     * For each incoming JSON log:
     * - It extracts the fields for tracking.
     * - If no state exists (i.e. first log for that MMSI), it creates a new VesselTracking record,
     *   updates the state, and emits a message to a kafka topic (vessel) for new vessel processing.
     * - Otherwise, it updates the existing VesselTracking state.
     * Additionally, it registers (or re–registers) a 5–minute processing–time timer.
     * When the timer fires (i.e. no new log has arrived for 5 minutes), it compares the latest log's timestamp
     * with the stored etaAis:
     *    - If the latest log timestamp is after the etaAis, the state is cleared.
     *    - Otherwise, an alarm event is emitted (to be processed by an alarm job), and the state is cleared.
     */
    public static class VesselTrackingProcessFunction extends KeyedProcessFunction<Long, String, VesselTracking> {

        // Managed keyed state for VesselTracking.
        private transient ValueState<VesselTracking> vesselState;
        // State to hold the timestamp of the currently registered timer.
        private transient ValueState<Long> timerState;
        
        private transient ObjectMapper mapper;

        // Timeout duration: 5 minutes in milliseconds.
        private static final long TIMEOUT = 5 * 60 * 1000L;
        // Threshold for deviation from trajectory (in meters).
        private static final double DEVIATION_THRESHOLD_METERS = 1000.0;

        // Initialize a KafkaProducer to send alarms directly.
        private transient KafkaProducer<String, String> alarmProducer;
        // KafkaProducer for sending vessel events.
        private transient KafkaProducer<String, String> vesselProducer;

        @Override
        public void open(Configuration parameters) throws Exception {
            ValueStateDescriptor<VesselTracking> vesselDescriptor =
                    new ValueStateDescriptor<>("vesselTrackingState", VesselTracking.class);
            vesselState = getRuntimeContext().getState(vesselDescriptor);

            ValueStateDescriptor<Long> timerDescriptor =
                    new ValueStateDescriptor<>("timerState", Long.class);
            timerState = getRuntimeContext().getState(timerDescriptor);

            mapper = new ObjectMapper();

            // Set up KafkaProducer properties.
            Properties props = new Properties();
            props.put("bootstrap.servers", "kafka.kafka.svc.cluster.local:9092");
            props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
            props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

            alarmProducer = new KafkaProducer<>(props);
            vesselProducer = new KafkaProducer<>(props);
        }

        @Override
        public void close() throws Exception {
            if (alarmProducer != null) {
                alarmProducer.close();
            }
            if (vesselProducer != null) {
                vesselProducer.close();
            }
        }

        @Override
        public void processElement(String value, Context ctx, Collector<VesselTracking> out) throws Exception {
            JsonNode node = mapper.readTree(value);
            long mmsi = node.get("MMSI").asLong();

            // Extract fields used for vessel tracking.
            double latitude = node.get("LATITUDE").asDouble();
            double longitude = node.get("LONGITUDE").asDouble();
            String timestamp = node.get("TIMESTAMP").asText();
            double destLat = node.get("DEST_LAT").asDouble();
            double destLon = node.get("DEST_LON").asDouble();
            String etaAis = node.get("ETA_AIS").asText();

            VesselTracking vt = vesselState.value();
            if (vt == null) {
                // First log for this MMSI: create a new VesselTracking record.
                vt = new VesselTracking(mmsi, latitude, longitude, timestamp,
                        latitude, longitude, timestamp, destLat, destLon, etaAis);
                vesselState.update(vt);

                // Extract additional fields for Cassandra.
                long imo = node.get("IMO").asLong();
                String callsign = node.get("CALLSIGN").asText();
                double a = node.get("A").asDouble();
                double b = node.get("B").asDouble();
                double c = node.get("C").asDouble();
                double d = node.get("D").asDouble();
                double draught = node.get("DRAUGHT").asDouble();

                // Emit a side output event for Cassandra processing.
                CassandraVesselInfo cassandraEvent = new CassandraVesselInfo(mmsi, imo, callsign, a, b, c, d, draught);
                sendVesselToKafka(cassandraEvent);
            } else {
                // Update the existing record with the latest position and timestamp.
                vt.setCurrentLat(latitude);
                vt.setCurrentLon(longitude);
                vt.setLatestLogTimestamp(timestamp);
                vesselState.update(vt);
            }

            long currentTime = ctx.timerService().currentProcessingTime();
            // Check if sufficient time has elapsed since the last alarm.
            if (currentTime >= vt.getLastDeviationAlarmTime() + TIMEOUT) {
                // --- Check for trajectory deviation ---
                double deviation = computeCrossTrackDistance(
                        vt.getLatSource(), vt.getLonSource(),
                        vt.getDestLat(), vt.getDestLon(),
                        vt.getCurrentLat(), vt.getCurrentLon()
                );
                if (deviation > DEVIATION_THRESHOLD_METERS) {
                    Alarm deviationAlarm = new Alarm(
                            UUID.randomUUID().toString(),         // unique alarm ID
                            vt.getMmsi(),                         // vessel MMSI
                            "E002",                               // error code for trajectory deviation
                            "Vessel deviates from planned trajectory by " + deviation + " meters.",
                            "active"
                    );
                    sendAlarmToKafka(deviationAlarm);
                    vt.setLastDeviationAlarmTime(currentTime);
                    vesselState.update(vt);
                }
                // --- End trajectory deviation check ---
            }

            // (Re)register the TIMEOUT timeout.
            currentTime = ctx.timerService().currentProcessingTime();
            long newTimeout = currentTime + TIMEOUT;
            Long currentTimer = timerState.value();
            if (currentTimer != null) {
                ctx.timerService().deleteProcessingTimeTimer(currentTimer);
            }
            ctx.timerService().registerProcessingTimeTimer(newTimeout);
            timerState.update(newTimeout);

            // Emit the current state.
            out.collect(vt);
        }

        @Override
        public void onTimer(long timestamp, OnTimerContext ctx, Collector<VesselTracking> out) throws Exception {
            VesselTracking vt = vesselState.value();
            if (vt != null) {
                try {
                    // Parse the latest log timestamp and the etaAis as OffsetDateTime.
                    OffsetDateTime latestLogTime = OffsetDateTime.parse(vt.getLatestLogTimestamp());
                    OffsetDateTime etaTime = OffsetDateTime.parse(vt.getEtaAis());
                    // Add a margin error value: TIMEOUT/2 milliseconds added to the latest log time.
                    OffsetDateTime marginTime = latestLogTime.plus(Duration.ofMillis(TIMEOUT / 2));
                    if (marginTime.isAfter(etaTime)) {
                        // If the latest log timestamp + margin error is after the etaAis, clear the state.
                        vesselState.clear();
                        timerState.clear();
                    } else {
                        // Create an alarm with a unique alarm ID and a formatted description.
                        Alarm alarm = new Alarm(
                                UUID.randomUUID().toString(),                          // unique alarm ID
                                vt.getMmsi(),                                          // vessel MMSI
                                "E001",                                                // error code
                                "Not received vessel AIS logs for " + Long.toString(TIMEOUT / (60 * 1000)) + " minutes",
                                "active"                                            
                        );
                        sendAlarmToKafka(alarm);
                        vesselState.clear();
                        timerState.clear();
                    }
                } catch (DateTimeParseException e) {
                    vesselState.clear();
                    timerState.clear();
                }
            }
        }

        // Helper method: Send an Alarm object to Kafka (serialize as JSON).
        private void sendAlarmToKafka(Alarm alarm) throws Exception {
            String alarmJson = mapper.writeValueAsString(alarm);
            ProducerRecord<String, String> record = new ProducerRecord<>("alarm", alarmJson);
            alarmProducer.send(record);
        }

        // Helper method: Send a CassandraVesselInfo object to Kafka (serialize as JSON).
        private void sendVesselToKafka(CassandraVesselInfo vesselInfo) throws Exception {
            String vesselJson = mapper.writeValueAsString(vesselInfo);
            ProducerRecord<String, String> record = new ProducerRecord<>("vessel", vesselJson);
            vesselProducer.send(record);
        }

        // --- Helper methods for computing cross-track distance ---
        /**
         * Computes the cross-track (perpendicular) distance from a point to the great-circle path
         * defined by the start (lat1, lon1) and end (lat2, lon2) points.
         * The returned distance is in meters.
         */
        private double computeCrossTrackDistance(double lat1, double lon1,
                                                 double lat2, double lon2,
                                                 double lat, double lon) {
            double R = 6371000; // Earth radius in meters
            double d13 = haversine(lat1, lon1, lat, lon);
            double theta13 = initialBearing(lat1, lon1, lat, lon);
            double theta12 = initialBearing(lat1, lon1, lat2, lon2);
            // cross-track distance formula on a sphere
            double crossTrack = Math.asin(Math.sin(d13 / R) * Math.sin(theta13 - theta12)) * R;
            return Math.abs(crossTrack);
        }

        /**
         * Computes the haversine distance (in meters) between two points specified in degrees.
         */
        private double haversine(double lat1, double lon1, double lat2, double lon2) {
            double R = 6371000; // Earth radius in meters
            double dLat = Math.toRadians(lat2 - lat1);
            double dLon = Math.toRadians(lon2 - lon1);
            double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                       Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                       Math.sin(dLon / 2) * Math.sin(dLon / 2);
            double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        }

        /**
         * Computes the initial bearing (in radians) from the start point to the end point.
         */
        private double initialBearing(double lat1, double lon1, double lat2, double lon2) {
            double phi1 = Math.toRadians(lat1);
            double phi2 = Math.toRadians(lat2);
            double deltaLon = Math.toRadians(lon2 - lon1);
            double y = Math.sin(deltaLon) * Math.cos(phi2);
            double x = Math.cos(phi1) * Math.sin(phi2) -
                       Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLon);
            return Math.atan2(y, x);
        }
    }
}