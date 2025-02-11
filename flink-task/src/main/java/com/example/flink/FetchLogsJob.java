package com.example.flink;

import com.example.flink.models.VesselTracking;
import com.example.flink.models.CassandraVesselInfo;
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
import org.apache.flink.util.OutputTag;

import java.io.Serializable;

/**
 * FetchLogsJob reads logs from the Kafka "vts" and "sat" topic, partitions them by MMSI using keyBy,
 * updates or creates a VesselTracking state (using a fault–tolerant ValueState),
 * and emits new vessel events (as CassandraVesselInfo objects) via a side output.
 */
public class FetchLogsJob {

    // The side output tag for new vessel events to be sent for Cassandra processing.
    public static final OutputTag<CassandraVesselInfo> NEW_VESSEL_OUTPUT_TAG =
            new OutputTag<CassandraVesselInfo>("new-vessel") {};

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

        // 5. Retrieve the side output stream (the new vessel events).
        DataStream<CassandraVesselInfo> cassandraEventStream =
                vesselTrackingStream.getSideOutput(NEW_VESSEL_OUTPUT_TAG);

        // Instead of reading these events from Kafka in a separate job,
        // we attach our Cassandra sink (defined in CassandraJob.java) to process them.
        cassandraEventStream.addSink(new CassandraJob.CassandraSink());

        // 6. Execute the job.
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
     * - It extracts the fields for tracking (latitude, timestamp, destination info, etc.).
     * - If no state exists yet (i.e. first log for that MMSI), it creates a new VesselTracking record,
     *   updates the state, and emits a side output event (CassandraVesselInfo) to be processed by a separate job.
     * - Otherwise, it updates the current position and latest timestamp.
     */
    public static class VesselTrackingProcessFunction extends KeyedProcessFunction<Long, String, VesselTracking> {

        // Managed keyed state for VesselTracking.
        private transient ValueState<VesselTracking> vesselState;
        
        private static final ObjectMapper mapper = new ObjectMapper();

        @Override
        public void open(Configuration parameters) throws Exception {
            ValueStateDescriptor<VesselTracking> descriptor =
                    new ValueStateDescriptor<>("vesselTrackingState", VesselTracking.class);
            vesselState = getRuntimeContext().getState(descriptor);
        }

        @Override
        public void processElement(String value, Context ctx, Collector<VesselTracking> out) throws Exception {
            JsonNode node = mapper.readTree(value);
            long mmsi = node.get("MMSI").asLong();

            // Extract fields used for vessel tracking.
            double latitude = node.get("latitude").asDouble();
            double longitude = node.get("longitude").asDouble();
            String timestamp = node.get("timestamp").asText();
            double destLat = node.get("destLat").asDouble();
            double destLon = node.get("destLon").asDouble();
            String etaAis = node.get("etaAis").asText();

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
                ctx.output(NEW_VESSEL_OUTPUT_TAG, cassandraEvent);
            } else {
                // Update the existing record with the latest position and timestamp.
                vt.setCurrentLat(latitude);
                vt.setCurrentLon(longitude);
                vt.setLatestLogTimestamp(timestamp);
                vesselState.update(vt);
            }
            out.collect(vt);
        }
    }
}