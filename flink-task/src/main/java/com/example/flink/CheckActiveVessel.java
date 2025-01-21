package com.example.flink;

import com.datastax.oss.driver.api.core.CqlSession;
import com.datastax.oss.driver.api.core.CqlSessionBuilder;
import org.apache.flink.api.common.eventtime.WatermarkStrategy;
import org.apache.flink.api.common.functions.RichFlatMapFunction;
import org.apache.flink.api.common.state.ValueState;
import org.apache.flink.api.common.state.ValueStateDescriptor;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.connector.kafka.source.KafkaSource;
import org.apache.flink.connector.kafka.source.enumerator.initializer.OffsetsInitializer;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.KeyedProcessFunction;
import org.apache.flink.util.Collector;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.InetSocketAddress;

import com.example.flink.models.Vessel;

public class CheckActiveVessel {

   static final long timer = 5 * 1000; //Timer in milliseconds

    /**
     * ProcessFunction to manage timers for each vessel.
     */
    public static class VesselTimeoutProcessFunction extends KeyedProcessFunction<Long, Vessel, Void> {
        private transient ValueState<Long> timerState;
        private transient CqlSession session;

        @Override
        public void open(Configuration parameters) throws Exception {
            // Initialize Cassandra session
            CqlSessionBuilder builder = CqlSession.builder()
                    .addContactPoint(new InetSocketAddress("cassandra.cassandra.svc.cluster.local", 9042))
                    .withLocalDatacenter("datacenter1")
                    .withKeyspace("vessel_management")
                    .withAuthCredentials("cassandra", "cassandra");
            this.session = builder.build();

            // Initialize state descriptor for the timer
            ValueStateDescriptor<Long> timerDescriptor = new ValueStateDescriptor<>("timerState", Long.class);
            timerState = getRuntimeContext().getState(timerDescriptor);
        }

        @Override
        public void processElement(Vessel vessel, Context ctx, Collector<Void> out) throws Exception {
            // Cancel the previous timer if it exists
            System.out.println("Setting timer for vessel with MMSI " + vessel.getMmsi());
            Long currentTimer = timerState.value();
            if (currentTimer != null) {
                ctx.timerService().deleteEventTimeTimer(currentTimer);
                System.out.println("TIMER RESET: Deleted previous timer for vessel with MMSI " + vessel.getMmsi());
            }

            // Set a new timer for 2 hours from now
            long newTimer = ctx.timestamp() + timer; // 2 hours in milliseconds
            ctx.timerService().registerEventTimeTimer(newTimer);
            timerState.update(newTimer);
            System.out.println("TIMER SET: New timer set for vessel with MMSI " + vessel.getMmsi());
        }

        @Override
        public void onTimer(long timestamp, OnTimerContext ctx, Collector<Void> out) throws Exception {
            // Timer expired: delete the vessel entry from Cassandra
            long mmsi = ctx.getCurrentKey();
            String deleteQuery = "DELETE FROM vessel WHERE mmsi = ?";
            session.execute(session.prepare(deleteQuery).bind(mmsi));
            // Clear the timer state
            timerState.clear();

            System.out.println("Deleted vessel with MMSI " + mmsi + " due to inactivity.");
        }

        @Override
        public void close() throws Exception {
            if (session != null) {
                session.close();
            }
        }
    }
}

