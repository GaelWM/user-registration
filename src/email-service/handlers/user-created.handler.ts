import { EachMessagePayload, Partitioners } from "kafkajs";
import kafka from "../startup/kafka";
import { SagaStepEventType, TopicNames } from "../shared/saga.model";
import winston from "winston";

export const subscribeToUserCreatedTopic = async (): Promise<void> => {
  const consumer = kafka.consumer({ groupId: "email-service-group" });
  consumer.subscribe({ topic: TopicNames.UserCreated, fromBeginning: true });
  await consumer.run({
    eachMessage: async (payload: EachMessagePayload) => {
      const { type, userId, userDetails } = JSON.parse(
        payload.message.value!.toString()
      );

      if (type === TopicNames.UserCreated) {
        console.log("Handling UserCreated event:", userId, userDetails);

        sendVerificationEmail(userId, userDetails.email);

        await publishEmailSentEvent(userId);

        console.log("EmailSent event published:", userId);
      }
    },
  });
};

// Send verification email
const sendVerificationEmail = (userId: string, email: string): void => {
  console.log("Sending verification email to:", email);
};

const publishEmailSentEvent = async (userId: string): Promise<void> => {
  const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
  });
  const event = {
    type: TopicNames.EmailSent,
    userId,
  };

  await producer.send({
    topic: TopicNames.EmailSent,
    messages: [{ value: JSON.stringify(event) }],
  });
};

// Start consumer
subscribeToUserCreatedTopic().catch((error) => {
  const message = `Error subscribing to ${SagaStepEventType.UserCreated} topic: ${error}`;
  winston.error(message);
  console.error(message);
});
