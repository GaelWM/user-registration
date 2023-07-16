import { Kafka } from "kafkajs";
import config from "config";

export default new Kafka({
  clientId: config.get("kafka.clientId"),
  brokers: config.get("kafka.brokers"),
});
