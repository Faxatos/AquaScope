package com.example.flink;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.flink.api.common.eventtime.WatermarkStrategy;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.connector.kafka.source.KafkaSource;
import org.apache.flink.connector.kafka.source.enumerator.initializer.OffsetsInitializer;
import org.apache.flink.connector.kafka.sink.KafkaSink;
import org.apache.flink.connector.kafka.sink.KafkaRecordSerializationSchema;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.api.common.functions.FlatMapFunction;
import org.apache.flink.util.Collector;

import java.util.Properties;

public class InjectDeviationJob {

    public static void main(String[] args) throws Exception {
        // 1. Set up the execution environment.
        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        // 2. Build Kafka sources to consume messages from the 'vts' and 'sat' topics.
        KafkaSource<String> kafkaSourceVts = KafkaSource.<String>builder()
                .setBootstrapServers("kafka.kafka.svc.cluster.local:9092")
                .setTopics("vts")
                .setGroupId("flink-vts-deviation-consumer-group")
                .setStartingOffsets(OffsetsInitializer.earliest())
                .setValueOnlyDeserializer(new SimpleStringSchema())
                .build();

        KafkaSource<String> kafkaSourceSat = KafkaSource.<String>builder()
                .setBootstrapServers("kafka.kafka.svc.cluster.local:9092")
                .setTopics("sat")
                .setGroupId("flink-sat-deviation-consumer-group")
                .setStartingOffsets(OffsetsInitializer.earliest())
                .setValueOnlyDeserializer(new SimpleStringSchema())
                .build();

        // 3. Create data streams from the Kafka sources.
        DataStream<String> vtsStream = env.fromSource(kafkaSourceVts, WatermarkStrategy.noWatermarks(), "KafkaSourceVts");
        DataStream<String> satStream = env.fromSource(kafkaSourceSat, WatermarkStrategy.noWatermarks(), "KafkaSourceSat");

        // 4. Union the two streams.
        DataStream<String> unifiedStream = vtsStream.union(satStream);

        // 5. With a very low probability, inject an artificial trajectory deviation by modifying LATITUDE and LONGITUDE.
        //    Use a FlatMapFunction so that only modified messages are emitted.
        DataStream<String> modifiedStream = unifiedStream.flatMap(new FlatMapFunction<String, String>() {
            // Set the probability to 0.00004 (i.e. 0.004% chance),
            // so that on average every 2/3 minutes (with 200 logs per second) a deviation is injected
            private static final double DEVIATION_PROBABILITY = 0.00004;
            private static final double LATITUDE_OFFSET = 1; // Offset value in degrees
            private static final double LONGITUDE_OFFSET = 1; // Offset value in degrees
            private transient ObjectMapper mapper;

            @Override
            public void flatMap(String value, Collector<String> out) throws Exception {
                if (mapper == null) {
                    mapper = new ObjectMapper();
                }
                try {
                    JsonNode node = mapper.readTree(value);
                    // Ensure the node is mutable and contains the required fields.
                    if (node.has("LATITUDE") && node.has("LONGITUDE") && node instanceof ObjectNode) {
                        // Decide whether to inject a deviation.
                        if (Math.random() < DEVIATION_PROBABILITY) {
                            ObjectNode objectNode = (ObjectNode) node;
                            double originalLat = objectNode.get("LATITUDE").asDouble();
                            double originalLon = objectNode.get("LONGITUDE").asDouble();
                            // Inject deviation by adding the offset values.
                            objectNode.put("LATITUDE", originalLat + LATITUDE_OFFSET);
                            objectNode.put("LONGITUDE", originalLon + LONGITUDE_OFFSET);
                            // Emit the modified record.
                            out.collect(mapper.writeValueAsString(objectNode));
                        }
                    }
                } catch (Exception e) {
                    // In case of a parsing error, ignore this record.
                }
            }
        });

        // 6. Define a Kafka sink to send the modified logs back to Kafka.
        //    Here we write them to the "vts" topic, but you can choose another topic if needed.
        KafkaSink<String> kafkaSink = KafkaSink.<String>builder()
                .setBootstrapServers("kafka.kafka.svc.cluster.local:9092")
                .setRecordSerializer(KafkaRecordSerializationSchema.builder()
                        .setTopic("vts")
                        .setValueSerializationSchema(new SimpleStringSchema())
                        .build())
                .build();

        // 7. Sink the modified stream to Kafka (only modified logs are sent).
        modifiedStream.sinkTo(kafkaSink);

        // 8. Execute the job.
        env.execute("Inject Trajectory Deviation Job");
    }
}
