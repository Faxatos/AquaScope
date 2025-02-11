package com.example.flink;

import com.example.flink.models.CassandraVesselInfo;
import com.datastax.oss.driver.api.core.CqlSession;
import com.datastax.oss.driver.api.core.CqlSessionBuilder;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.streaming.api.functions.sink.RichSinkFunction;

import java.net.InetSocketAddress;

/**
 * CassandraJob contains a sink function that writes CassandraVesselInfo events into Cassandra.
 * This sink is to a DataStream<CassandraVesselInfo> (output from MainFlinkJob).
 */
public class CassandraCheckJob {

    public static class CassandraSink extends RichSinkFunction<CassandraVesselInfo> {
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
        public void invoke(CassandraVesselInfo value, Context context) throws Exception {
            // Check if the vessel already exists.
            String selectQuery = "SELECT mmsi FROM vessel WHERE mmsi = ?";
            boolean vesselExists = session.execute(
                    session.prepare(selectQuery).bind(value.getMmsi())
            ).one() != null;

            if (!vesselExists) {
                // Insert the vessel into Cassandra.
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
