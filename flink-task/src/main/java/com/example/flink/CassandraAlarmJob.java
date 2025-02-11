package com.example.flink;

import com.example.flink.models.Alarm;
import com.datastax.oss.driver.api.core.CqlSession;
import com.datastax.oss.driver.api.core.CqlSessionBuilder;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.streaming.api.functions.sink.RichSinkFunction;

import java.net.InetSocketAddress;

/**
 * CassandraAlarmJob contains a dedicated sink function that writes Alarm events into Cassandra.
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
 * You can attach this sink to a DataStream<Alarm> (for example, the alarm side output from your FetchLogsJob).
 */
public class CassandraAlarmJob {

    public static class CassandraAlarmSink extends RichSinkFunction<Alarm> {
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
        public void invoke(Alarm alarm, Context context) throws Exception {
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
