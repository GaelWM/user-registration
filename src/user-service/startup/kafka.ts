import { Kafka } from "kafkajs";
import config from "config";

const kafkaBrokerHost =
  process.env.KAFKA_BROKER_HOST ?? config.get("kafka.host") ?? "kafka:9092";

const kafka = new Kafka({
  clientId: config.get("kafka.clientId"),
  brokers: [kafkaBrokerHost],
});

export default kafka;
