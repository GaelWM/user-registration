import { EachMessagePayload } from "kafkajs";
import kafka from "../startup/kafka";
import { TopicNames } from "../shared/saga.model";
import { updateUser } from "../models/user.model";
import winston from "winston";

export const subscribeToEmailSentTopic = async (): Promise<void> => {
  const consumer = kafka.consumer({
    groupId: "user-service-group",
    metadataMaxAge: 3000,
  });
  await consumer.connect();
  await consumer.subscribe({
    topic: TopicNames.EmailSent,
    fromBeginning: true,
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
      const { type, userId, token } = JSON.parse(message.value!.toString());

      if (type === TopicNames.EmailSent) {
        console.log("Handling EmailSent event:", userId, token);

        try {
          await updateUser(userId, token);
        } catch (error: any) {
          console.error(error.message);
          winston.error(error.message);
        }

        // Acknowledge (commit) the message
        await consumer.commitOffsets([
          { topic, partition, offset: message.offset },
        ]);
      }
    },
  });
};
