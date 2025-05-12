package com.example.flink;

import com.example.flink.models.CassandraVesselInfo;
import com.datastax.oss.driver.api.core.CqlSession;
import com.datastax.oss.driver.api.core.CqlSessionBuilder;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.flink.api.common.eventtime.WatermarkStrategy;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.connector.kafka.source.KafkaSource;
import org.apache.flink.connector.kafka.source.enumerator.initializer.OffsetsInitializer;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.ProcessFunction;
import org.apache.flink.api.common.functions.MapFunction;
import org.apache.flink.util.Collector;
import java.util.concurrent.TimeUnit;

import java.net.InetSocketAddress;

/**
 * CassandraVesselJob consumes vessel events from a Kafka topic ("vessel") and writes them into Cassandra.
 * This job uses a ProcessFunction to:
 *   - Read JSON messages from Kafka,
 *   - Map them to CassandraVesselInfo objects, and
 *   - Insert them into Cassandra.
 */
public class CassandraVesselJob {

    public static void main(String[] args) throws Exception {
        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        // 1. Create a Kafka source for vessel events from topic "vessel".
        KafkaSource<String> kafkaSource = createKafkaSourceWithRetry();

        DataStream<String> vesselJsonStream =
                env.fromSource(kafkaSource, WatermarkStrategy.noWatermarks(), "KafkaVesselSource");

        // 2. Map the JSON strings to CassandraVesselInfo objects.
        DataStream<CassandraVesselInfo> vesselStream = vesselJsonStream.map(new VesselInfoMapper());

        // 3. Process each CassandraVesselInfo and insert it into Cassandra.
        DataStream<String> resultStream = vesselStream.process(new CassandraVesselProcessFunction());

        resultStream.print();

        env.execute("Cassandra Vessel Job");
    }

    public static class VesselInfoMapper implements MapFunction<String, CassandraVesselInfo> {
        private final ObjectMapper mapper = new ObjectMapper();
        @Override
        public CassandraVesselInfo map(String value) throws Exception {
            return mapper.readValue(value, CassandraVesselInfo.class);
        }
    }

    /**
     * Creates a Kafka source with retry logic if Kafka is unavailable.
     */
    private static KafkaSource<String> createKafkaSourceWithRetry() throws InterruptedException {
        final long RETRY_DELAY_MS = 5000;
        int attempt = 0;

        while (true) {
            try {
                return KafkaSource.<String>builder()
                    .setBootstrapServers("my-cluster-kafka-bootstrap.kafka.svc.cluster.local:9092")
                    .setTopics("vessel")
                    .setGroupId("flink-vessel-consumer-group")
                    .setStartingOffsets(OffsetsInitializer.earliest())
                    .setValueOnlyDeserializer(new SimpleStringSchema())
                    .build();
            } catch (Exception e) {
                attempt++;
                System.err.println("Kafka connection failed (attempt " + attempt + "). Retrying in " + (RETRY_DELAY_MS / 1000) + " seconds...");
                TimeUnit.MILLISECONDS.sleep(RETRY_DELAY_MS);
            }
        }
    }

    public static class CassandraVesselProcessFunction extends ProcessFunction<CassandraVesselInfo, String> {
        private final long RETRY_DELAY_MS = 5000;
        private transient CqlSession session;

        @Override
        public void open(Configuration parameters) throws Exception {
            super.open(parameters);
            boolean connected = false;
            int attempt = 0;
            while (!connected) {
                try {
                    CqlSessionBuilder builder = CqlSession.builder()
                            .addContactPoint(new InetSocketAddress("cassandra.cassandra.svc.cluster.local", 9042))
                            .withLocalDatacenter("datacenter1")
                            .withKeyspace("vessel_management")
                            .withAuthCredentials("cassandra", "cassandra");
                    session = builder.build();
                    connected = true;
                } catch (Exception e) {
                    attempt++;
                    System.err.println("Cassandra connection failed (attempt " + attempt + "). Retrying in " + (RETRY_DELAY_MS / 1000) + " seconds...");
                    Thread.sleep(RETRY_DELAY_MS);
                }
            }
        }

        @Override
        public void processElement(CassandraVesselInfo value, Context ctx, Collector<String> out) throws Exception {
            boolean success = false;
            int attempt = 0;

            // Retry the insert indefinitely until successful.
            while (!success) {
                try {
                    // Check if the vessel already exists.
                    String selectQuery = "SELECT mmsi FROM vessel WHERE mmsi = ?";
                    boolean vesselExists = session.execute(
                            session.prepare(selectQuery).bind(value.getMmsi())
                    ).one() != null;
                    
                    if (!vesselExists) {
                        String insertQuery = "INSERT INTO vessel (mmsi, imo, callsign, a, b, c, d, draught) " +
                                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                        session.execute(
                                session.prepare(insertQuery).bind(
                                        value.getMmsi(),
                                        value.getImo(),
                                        value.getCallsign(),
                                        value.getA(),
                                        value.getB(),
                                        value.getC(),
                                        value.getD(),
                                        value.getDraught()
                                )
                        );
                        out.collect("Inserted vessel with MMSI " + value.getMmsi());
                    } else {
                        out.collect("Vessel with MMSI " + value.getMmsi() + " already exists. Skipped insertion.");
                    }
                    // Mark the operation as successful so we exit the retry loop.
                    success = true;
                } catch (Exception e) {
                    attempt++;
                    System.err.println("Error processing vessel with MMSI " + value.getMmsi() +
                            " (attempt " + attempt + "). Retrying in " + (RETRY_DELAY_MS / 1000) + " seconds...");
                    Thread.sleep(RETRY_DELAY_MS);
                    
                    // Attempt to re-establish the Cassandra connection.
                    try {
                        if (session != null) {
                            session.close();
                        }
                    } catch (Exception ex) {
                        // Ignore errors during session close.
                    }
                    
                    boolean connected = false;
                    while (!connected) {
                        try {
                            // Reinitialize the Cassandra session.
                            CqlSessionBuilder builder = CqlSession.builder()
                                    .addContactPoint(new InetSocketAddress("cassandra.cassandra.svc.cluster.local", 9042))
                                    .withLocalDatacenter("datacenter1")
                                    .withKeyspace("vessel_management")
                                    .withAuthCredentials("cassandra", "cassandra");
                            session = builder.build();
                            connected = true;
                        } catch (Exception connEx) {
                            System.err.println("Reconnection to Cassandra failed. Retrying in " + (RETRY_DELAY_MS / 1000) + " seconds...");
                            Thread.sleep(RETRY_DELAY_MS);
                        }
                    }
                }
            }
        }


        @Override
        public void close() throws Exception {
            if (session != null) {
                session.close();
            }
            super.close();
        }
    }
}
