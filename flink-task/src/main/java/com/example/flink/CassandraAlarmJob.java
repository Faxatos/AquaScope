package com.example.flink;

import com.example.flink.models.Alarm;
import com.datastax.oss.driver.api.core.CqlSession;
import com.datastax.oss.driver.api.core.CqlSessionBuilder;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.flink.api.common.eventtime.WatermarkStrategy;
import java.util.concurrent.TimeUnit;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.connector.kafka.source.KafkaSource;
import org.apache.flink.connector.kafka.source.enumerator.initializer.OffsetsInitializer;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.ProcessFunction;
import org.apache.flink.api.common.functions.MapFunction;
import org.apache.flink.util.Collector;

import java.net.InetSocketAddress;
import java.time.Instant;

/**
 * CassandraAlarmJob fetch data from the Kafka topic 'alarm', and writes Alarm events into Cassandra.
 *
 * The Cassandra alarm table is assumed to have the following schema:
 *
 *   CREATE TABLE IF NOT EXISTS alarm (
 *       alarm_id TEXT,
 *       mmsi BIGINT,
 *       timestamp TIMESTAMP,
 *       code TEXT,
 *       description TEXT,
 *       status TEXT,
 *       PRIMARY KEY ((alarm_id), mmsi, timestamp)
 *   ) WITH CLUSTERING ORDER BY (mmsi ASC, timestamp DESC);
 *
 *   CREATE INDEX IF NOT EXISTS alarm_mmsi_idx ON alarm (mmsi);
 *
 */
public class CassandraAlarmJob {

    public static void main(String[] args) throws Exception {
        // 1. Set up the Flink execution environment.
        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        // 2. Create a Kafka source for alarm events from the topic "alarm".
        KafkaSource<String> kafkaSource = createKafkaSourceWithRetry();

        DataStream<String> alarmJsonStream =
                env.fromSource(kafkaSource, WatermarkStrategy.noWatermarks(), "KafkaAlarmSource");

        // 3. Map the JSON strings to Alarm objects.
        DataStream<Alarm> alarmStream = alarmJsonStream.map(new AlarmMapper());

        // 4. Process each Alarm object using a ProcessFunction that inserts it into Cassandra.
        DataStream<String> resultStream = alarmStream.process(new CassandraAlarmProcessFunction());

        // For debugging purposes, print the result messages.
        resultStream.print();

        env.execute("Cassandra Alarm Job");
    }

    /**
     * A mapper to convert JSON strings into Alarm objects.
     */
    public static class AlarmMapper implements MapFunction<String, Alarm> {
        private final ObjectMapper mapper = new ObjectMapper();

        @Override
        public Alarm map(String value) throws Exception {
            Alarm alarm = mapper.readValue(value, Alarm.class);
            return alarm;
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
                        .setBootstrapServers("kafka.kafka.svc.cluster.local:9092")
                        .setTopics("alarm")
                        .setGroupId("flink-alarm-consumer-group")
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

    /**
     * A ProcessFunction that inserts each Alarm object into Cassandra.
     * Instead of using a dedicated sink, this function uses processElement() to perform the insert.
     */
    public static class CassandraAlarmProcessFunction extends ProcessFunction<Alarm, String> {
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

        public void processElement(Alarm alarm, Context ctx, Collector<String> out) throws Exception {
            Instant now = Instant.now();
            String insertQuery = "INSERT INTO alarm (alarm_id, timestamp, mmsi, code, description, status) VALUES (?, ?, ?, ?, ?, ?)";
            boolean inserted = false;
            int attempt = 0;

            // Retry the insert indefinitely until successful.
            while (!inserted) {
                try {
                    session.execute(
                            session.prepare(insertQuery).bind(
                                    alarm.getAlarmId(),
                                    now,
                                    alarm.getMmsi(),
                                    alarm.getCode(),
                                    alarm.getDescription(),
                                    alarm.getStatus()
                            )
                    );
                    inserted = true;
                    out.collect("Inserted alarm for vessel " + alarm.getMmsi());
                } catch (Exception e) {
                    attempt++;
                    System.err.println("Failed to insert alarm for vessel " + alarm.getMmsi() +
                            " (attempt " + attempt + "). Retrying in " + (RETRY_DELAY_MS / 1000) + " seconds...");
                    Thread.sleep(RETRY_DELAY_MS);

                    // Attempt to re-establish the Cassandra connection.
                    try {
                        if (session != null) {
                            session.close();
                        }
                    } catch (Exception ex) {
                        // Ignore errors on close.
                    }
                    boolean connected = false;
                    while (!connected) {
                        try {
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