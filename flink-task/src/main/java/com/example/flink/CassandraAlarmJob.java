package com.example.flink;

import com.example.flink.models.Alarm;
import com.datastax.oss.driver.api.core.CqlSession;
import com.datastax.oss.driver.api.core.CqlSessionBuilder;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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
        private final ObjectMapper mapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

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
        final int MAX_RETRIES = 5;
        final long RETRY_DELAY_MS = 5000;
        int attempt = 0;

        while (attempt < MAX_RETRIES) {
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
        throw new RuntimeException("Failed to connect to Kafka after " + MAX_RETRIES + " attempts.");
    }

    /**
     * A ProcessFunction that inserts each Alarm object into Cassandra.
     * Instead of using a dedicated sink, this function uses processElement() to perform the insert.
     */
    public static class CassandraAlarmProcessFunction extends ProcessFunction<Alarm, String> {
        private transient CqlSession session;

        @Override
        public void open(Configuration parameters) throws Exception {
            super.open(parameters);
            CqlSessionBuilder builder = CqlSession.builder()
                    .addContactPoint(new InetSocketAddress("cassandra.cassandra.svc.cluster.local", 9042))
                    .withLocalDatacenter("datacenter1")
                    .withKeyspace("vessel_management")
                    .withAuthCredentials("cassandra", "cassandra");
            session = builder.build();
        }

        @Override
        public void processElement(Alarm alarm, Context ctx, Collector<String> out) throws Exception {
            String insertQuery = "INSERT INTO alarm (alarm_id, timestamp, mmsi, code, description, status) " +
                                 "VALUES (?, ?, ?, ?, ?, ?)";
            session.execute(
                    session.prepare(insertQuery).bind(
                            alarm.getAlarmId(),
                            alarm.getTimestamp(),
                            alarm.getMmsi(),
                            alarm.getCode(),
                            alarm.getDescription(),
                            alarm.getStatus()
                    )
            );
            out.collect("Inserted alarm for vessel " + alarm.getMmsi());
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