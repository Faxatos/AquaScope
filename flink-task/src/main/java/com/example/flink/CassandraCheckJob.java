package com.example.flink;

import com.datastax.oss.driver.api.core.CqlSession;
import com.datastax.oss.driver.api.core.CqlSessionBuilder;
import org.apache.flink.api.common.functions.RichMapFunction;
import org.apache.flink.configuration.Configuration;
import java.net.InetSocketAddress;
import com.example.flink.models.Vessel;

public class CassandraCheckJob {

    public static class CheckAndInsertVessel extends RichMapFunction<Vessel, String> {
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
        public String map(Vessel vessel) throws Exception {
            // Check if vessel exists
            String selectQuery = "SELECT mmsi FROM vessel WHERE mmsi = ?";
            boolean exists = session.execute(
                    session.prepare(selectQuery).bind(vessel.getMmsi())).one() != null;

            // If vessel doesn't exist, insert it
            if (!exists) {
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
                                        vessel.getDraught()));
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
}
