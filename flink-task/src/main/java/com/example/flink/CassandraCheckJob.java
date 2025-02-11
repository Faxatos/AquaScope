package com.example.flink;

import com.datastax.oss.driver.api.core.CqlSession;
import com.datastax.oss.driver.api.core.CqlSessionBuilder;
import org.apache.flink.api.common.eventtime.WatermarkStrategy;
import org.apache.flink.api.common.functions.RichMapFunction;
import org.apache.flink.api.connector.source.Source;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.connector.kafka.source.KafkaSource;
import org.apache.flink.connector.kafka.source.enumerator.initializer.OffsetsInitializer;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.InetSocketAddress;

public class CassandraCheckJob {
    public static void main(String[] args) throws Exception {
        // 1) Set up the Flink execution environment
        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        // 2) Build a Kafka source to consume messages from the 'vts' topic
        KafkaSource<String> kafkaSource = KafkaSource.<String>builder()
                .setBootstrapServers("kafka.kafka.svc.cluster.local:9092")
                .setTopics("vts")
                .setGroupId("flink-vts-consumer-group")
                .setStartingOffsets(OffsetsInitializer.earliest())
                .setValueOnlyDeserializer(new SimpleStringSchema())
                .build();

        // 3) Ingest the Kafka data as a DataStream
        env.fromSource(
                        kafkaSource,
                        WatermarkStrategy.noWatermarks(),
                        "KafkaVtsSource")
                // 4) Map each line to a processed result (or do something with it)
                .map(new CassandraCheckMapFunction())
                // 5) For demonstration, we print the status result
                .print();

        // 6) Execute the Flink job
        env.execute("Flink Cassandra Vessel Check Job (Kafka Source)");
    }

    /**
     * A RichMapFunction that:
     *  - Parses JSON from the incoming string.
     *  - Connects to Cassandra, checks if the vessel (MMSI) already exists.
     *  - If not, inserts it.
     *  - Returns a small status message.
     */
    public static class CassandraCheckMapFunction extends RichMapFunction<String, String> {

        private static final long serialVersionUID = 1L;

        private transient CqlSession session;
        private static final ObjectMapper MAPPER = new ObjectMapper();

        @Override
        public void open(Configuration parameters) throws Exception {
            super.open(parameters);
            CqlSessionBuilder builder = CqlSession.builder()
                .addContactPoint(new InetSocketAddress("cassandra.cassandra.svc.cluster.local", 9042))
                .withLocalDatacenter("datacenter1")
                .withKeyspace("vessel_management")
                .withAuthCredentials("cassandra", "cassandra");
            this.session = builder.build();
        }

        @Override
        public String map(String value) throws Exception {
            try {
                // 2) Parse the incoming JSON
                JsonNode node = MAPPER.readTree(value);

                // Extract relevant fields
                long mmsi = node.get("MMSI").asLong();
                long imo = node.get("IMO").asLong();
                String cs = node.get("CALLSIGN").asText();
                double a = node.get("A").asDouble();
                double b = node.get("B").asDouble();
                double c = node.get("C").asDouble();
                double d = node.get("D").asDouble();
                double draught = node.get("DRAUGHT").asDouble();

                // 3) Check if the vessel already exists
                String selectQuery = "SELECT mmsi FROM vessel WHERE mmsi = ?";
                boolean vesselExists = session.execute(
                        session.prepare(selectQuery).bind(mmsi)
                ).one() != null;

                // 4) If it doesn't exist, insert the record
                if (!vesselExists) {
                    String insertQuery = "INSERT INTO vessel (mmsi, imo, callsign, a, b, c, d, draught) "
                            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                    session.execute(
                            session.prepare(insertQuery)
                                    .bind(mmsi, imo, cs, a, b, c, d, draught)
                    );
                    return "Inserted new vessel with MMSI " + mmsi;
                } else {
                    return "Vessel with MMSI " + mmsi + " already exists. Skipped insertion.";
                }
            } catch (Exception ex) {
                // Log or handle parse/connection errors
                return "Error processing record: " + ex.getMessage();
            }
        }

        @Override
        public void close() throws Exception {
            super.close();
            if (session != null) {
                session.close();
            }
        }
    }
}