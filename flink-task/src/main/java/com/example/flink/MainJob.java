package com.example.flink;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

import org.apache.flink.api.common.eventtime.WatermarkStrategy;
import org.apache.flink.api.common.functions.RichFlatMapFunction;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.connector.kafka.source.KafkaSource;
import org.apache.flink.connector.kafka.source.enumerator.initializer.OffsetsInitializer;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.util.Collector;

import com.example.flink.models.Vessel;

public class MainJob {
   private static final String KAFKA_BOOTSTRAP_SERVERS = "kafka.kafka.svc.cluster.local:9092";
   private static final String KAFKA_TOPIC = "vts";
   private static final String KAFKA_GROUP_ID = "flink-vts-consumer-group";

   public static void main(String[] args) throws Exception {
      StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
      DataStream<Vessel> vesselStream = createVesselStream(env);
      
      processVesselStream(vesselStream);
      
      env.execute("Main Vessel Processing Job");
   }

   private static DataStream<Vessel> createVesselStream(StreamExecutionEnvironment env) {
      KafkaSource<String> kafkaSource = createKafkaSource();
      
      return env.fromSource(kafkaSource, WatermarkStrategy.noWatermarks(), "KafkaVtsSource")
             .flatMap(new VesselJsonParser());
   }

   private static KafkaSource<String> createKafkaSource() {
      return KafkaSource.<String>builder()
            .setBootstrapServers(KAFKA_BOOTSTRAP_SERVERS)
            .setTopics(KAFKA_TOPIC)
            .setGroupId(KAFKA_GROUP_ID)
            .setStartingOffsets(OffsetsInitializer.earliest())
            .setValueOnlyDeserializer(new SimpleStringSchema())
            .build();
   }

   private static void processVesselStream(DataStream<Vessel> vesselStream) {
      // Cassandra processing chain
      vesselStream
            .map(new CassandraCheckJob.CheckAndInsertVessel())
            .name("Check and Insert Vessel");

      // Active vessel processing chain
      vesselStream
         .keyBy(vessel -> vessel.getMmsi())
         .process(new CheckActiveVessel.VesselTimeoutProcessFunction())
         .name("Vessel Timeout Process");
   }

   private static class VesselJsonParser extends RichFlatMapFunction<String, Vessel> {
      private static final ObjectMapper MAPPER = new ObjectMapper();

      @Override
      public void flatMap(String value, Collector<Vessel> out) throws Exception {
         try {
            JsonNode node = MAPPER.readTree(value);
            Vessel vessel = parseVesselFromJson(node);
            out.collect(vessel);
         } catch (Exception e) {
            System.err.println("Error parsing JSON: " + e.getMessage());
         }
      }

      private Vessel parseVesselFromJson(JsonNode node) {
          return new Vessel(
               node.get("MMSI").asLong(),
               node.get("IMO").asLong(),
               node.get("CALLSIGN").asText(),
               node.get("A").asDouble(),
               node.get("B").asDouble(),
               node.get("C").asDouble(),
               node.get("D").asDouble(),
               node.get("DRAUGHT").asDouble(),
               node.get("DESTINATION").asText(),
               node.get("LOCODE").asText(),
               node.get("ZONE").asText(),
               node.get("ECA").asBoolean(),
               node.get("SRC").asText(),
               node.get("LATITUDE").asDouble(),
               node.get("LONGITUDE").asDouble(),
               node.get("COURSE").asDouble(),
               node.get("SPEED").asDouble(),
               OffsetDateTime.parse(node.get("ETA_AIS").asText(), DateTimeFormatter.ISO_OFFSET_DATE_TIME),
               node.get("DEST_LAT").asDouble(),
               node.get("DEST_LON").asDouble(),
               OffsetDateTime.parse(node.get("TIMESTAMP").asText(), DateTimeFormatter.ISO_OFFSET_DATE_TIME)
          );
      }
   }
}