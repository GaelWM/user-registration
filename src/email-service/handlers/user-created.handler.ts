import { EachMessagePayload, Partitioners } from "kafkajs";
import * as jwt from "jsonwebtoken";
import { v4 } from "uuid";
import config from "config";
import kafka from "../startup/kafka";
import { TopicNames } from "../shared/saga.model";
import transporter from "../shared/nodemailer";
import { saveEmail } from "../models/email-mgt.model";

export const subscribeToUserCreatedTopic = async (): Promise<void> => {
  const consumer = kafka.consumer({
    groupId: "email-service-group",
    metadataMaxAge: 3000,
  });
  await consumer.connect();
  await consumer.subscribe({
    topic: TopicNames.UserCreated,
    fromBeginning: true,
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
      const { type, userId, userDetails } = JSON.parse(
        message.value!.toString()
      );

      if (type === TopicNames.UserCreated) {
        console.log("Handling UserCreated event:", userId, userDetails);

        const token = generateToken(userDetails.email);
        await registerToken(token, userDetails.email);
        sendVerificationEmail(userId, userDetails.email, token);

        // Acknowledge (commit) the message
        await consumer.commitOffsets([
          { topic, partition, offset: message.offset },
        ]);
      }
    },
  });
};

// Send verification email
const sendVerificationEmail = (
  userId: string,
  email: string,
  token: string
): void => {
  const mailOptions = {
    from: "user-registration@test.com",
    to: email,
    subject: "Hello User",
    text: `Please click on the link below to verify your email address: ${config.get(
      "user-service.host"
    )}/auth/verify-user?email=${email}&token=${token}`,
  };

  transporter.sendMail(mailOptions, async function (error, info) {
    if (error) {
      console.log(error);
      await publishEmailNotSentEvent(userId);
    } else {
      console.log("Email sent: " + info.response);
      await publishEmailSentEvent(userId, token);
    }
  });
};

const generateToken = (email: string): string => {
  return jwt.sign({ name: email }, config.get("jwtSecret") ?? v4(), {
    expiresIn: config.get("jwtExpirationSeconds") ?? 360,
  });
};

const publishEmailSentEvent = async (
  userId: string,
  token: string
): Promise<void> => {
  const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
  });
  const event = {
    type: TopicNames.EmailSent,
    userId,
    token,
  };

  await producer.connect();
  const published = await producer.send({
    topic: TopicNames.EmailSent,
    messages: [{ value: JSON.stringify(event) }],
  });
  console.log("published: ", published);
  await producer.disconnect();
};

const registerToken = async (token: string, email: string): Promise<void> => {
  try {
    await saveEmail(token, email);
  } catch (error: any) {
    console.log(error.message);
  }
};

const publishEmailNotSentEvent = async (userId: string): Promise<void> => {
  const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
  });
  const event = {
    type: TopicNames.EmailNotSent,
    userId,
    message: "Email not sent.",
  };

  await producer.connect();
  await producer.send({
    topic: TopicNames.EmailNotSent,
    messages: [{ value: JSON.stringify(event) }],
  });
  await producer.disconnect();
};
