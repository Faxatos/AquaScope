package com.example.flink;

import com.datastax.oss.driver.api.core.CqlSession;
import com.datastax.oss.driver.api.core.CqlSessionBuilder;
import org.apache.flink.api.common.eventtime.WatermarkStrategy;
import org.apache.flink.api.common.functions.RichMapFunction;
import org.apache.flink.api.common.functions.RichFlatMapFunction;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.connector.kafka.source.KafkaSource;
import org.apache.flink.connector.kafka.source.enumerator.initializer.OffsetsInitializer;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.util.Collector;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.InetSocketAddress;

public class CassandraCheckJob {
    public static void main(String[] args) throws Exception {
        // 1) Set up the Flink execution environment
        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        // 2) Build a Kafka source
        KafkaSource<String> kafkaSource = KafkaSource.<String>builder()
                .setBootstrapServers("kafka.kafka.svc.cluster.local:9092")
                .setTopics("vts")
                .setGroupId("flink-vts-consumer-group")
                .setStartingOffsets(OffsetsInitializer.earliest())
                .setValueOnlyDeserializer(new SimpleStringSchema())
                .build();

        // 3) Define the pipeline
        env.fromSource(
                        kafkaSource,
                        WatermarkStrategy.noWatermarks(),
                        "KafkaVtsSource")
                // Parse incoming JSON strings into structured objects
                .flatMap(new ParseJsonFunction())
                .startNewChain() // Separa questo operatore dalla catena precedente
                // Check if vessel exists in Cassandra
                .map(new CheckVesselInCassandra())
                .startNewChain() // Separa anche questo operatore
                // Insert new vessel in Cassandra
                .map(new InsertNewVesselInCassandra())
                .startNewChain(); // Separa ulteriormente
                // Print the results for demo

        // 4) Execute the Flink job
        env.execute("Flink Cassandra Vessel Check Job (Kafka Source)");
    }

    /**
     * FlatMapFunction to parse incoming JSON strings.
     */
    public static class ParseJsonFunction extends RichFlatMapFunction<String, Vessel> {
        private static final ObjectMapper MAPPER = new ObjectMapper();

        @Override
        public void flatMap(String value, Collector<Vessel> out) throws Exception {
            try {
                JsonNode node = MAPPER.readTree(value);
                Vessel vessel = new Vessel(
                        node.get("MMSI").asLong(),
                        node.get("IMO").asLong(),
                        node.get("CALLSIGN").asText(),
                        node.get("A").asDouble(),
                        node.get("B").asDouble(),
                        node.get("C").asDouble(),
                        node.get("D").asDouble(),
                        node.get("DRAUGHT").asDouble()
                );
                out.collect(vessel);
            } catch (Exception e) {
                System.err.println("Error parsing JSON: " + e.getMessage());
            }
        }
    }

    /**
     * MapFunction to check if the vessel exists in Cassandra.
     */
    public static class CheckVesselInCassandra extends RichMapFunction<Vessel, VesselStatus> {
        private transient CqlSession session;

        @Override
        public void open(Configuration parameters) throws Exception {
            CqlSessionBuilder builder = CqlSession.builder()
                    .addContactPoint(new InetSocketAddress("cassandra.cassandra.svc.cluster.local", 9042))
                    .withLocalDatacenter("datacenter1")
                    .withKeyspace("vessel_management")
                    .withAuthCredentials("cassandra", "cassandra");
            this.session = builder.build();
        }

        @Override
        public VesselStatus map(Vessel vessel) throws Exception {
            String selectQuery = "SELECT mmsi FROM vessel WHERE mmsi = ?";
            boolean exists = session.execute(
                    session.prepare(selectQuery).bind(vessel.getMmsi())
            ).one() != null;
            return new VesselStatus(vessel, exists);
        }

        @Override
        public void close() throws Exception {
            if (session != null) {
                session.close();
            }
        }
    }

    /**
     * MapFunction to insert a new vessel into Cassandra if it doesn't exist.
     */
    public static class InsertNewVesselInCassandra extends RichMapFunction<VesselStatus, String> {
        private transient CqlSession session;

        @Override
        public void open(Configuration parameters) throws Exception {
            CqlSessionBuilder builder = CqlSession.builder()
                    .addContactPoint(new InetSocketAddress("cassandra.cassandra.svc.cluster.local", 9042))
                    .withLocalDatacenter("datacenter1")
                    .withKeyspace("vessel_management")
                    .withAuthCredentials("cassandra", "cassandra");
            this.session = builder.build();
        }

        @Override
        public String map(VesselStatus vesselStatus) throws Exception {
            Vessel vessel = vesselStatus.getVessel();
            if (!vesselStatus.exists()) {
                String insertQuery = "INSERT INTO vessel (mmsi, imo, callsign, a, b, c, d, draught) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                session.execute(
                        session.prepare(insertQuery)
                                .bind(
                                        vessel.getMmsi(),
                                        vessel.getImo(),
                                        vessel.getCallsign(),
                                        vessel.getA(),
                                        vessel.getB(),
                                        vessel.getC(),
                                        vessel.getD(),
                                        vessel.getDraught()
                                )
                );
                return "Inserted new vessel with MMSI " + vessel.getMmsi();
            }
            return "Vessel with MMSI " + vessel.getMmsi() + " already exists.";
        }

        @Override
        public void close() throws Exception {
            if (session != null) {
                session.close();
            }
        }
    }

    /**
     * POJO for Vessel data.
     */
    public static class Vessel {
        private final long mmsi;
        private final long imo;
        private final String callsign;
        private final double a, b, c, d, draught;

        public Vessel(long mmsi, long imo, String callsign, double a, double b, double c, double d, double draught) {
            this.mmsi = mmsi;
            this.imo = imo;
            this.callsign = callsign;
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.draught = draught;
        }

        public long getMmsi() {
            return mmsi;
        }

        public long getImo() {
            return imo;
        }

        public String getCallsign() {
            return callsign;
        }

        public double getA() {
            return a;
        }

        public double getB() {
            return b;
        }

        public double getC() {
            return c;
        }

        public double getD() {
            return d;
        }

        public double getDraught() {
            return draught;
        }
    }

    /**
     * POJO for VesselStatus.
     */
    public static class VesselStatus {
        private final Vessel vessel;
        private final boolean exists;

        public VesselStatus(Vessel vessel, boolean exists) {
            this.vessel = vessel;
            this.exists = exists;
        }

        public Vessel getVessel() {
            return vessel;
        }

        public boolean exists() {
            return exists;
        }
    }
}
