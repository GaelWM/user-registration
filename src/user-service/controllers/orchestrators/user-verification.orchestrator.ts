import winston from "winston";
import { Saga, SagaStepEventType, TopicNames } from "../../shared/saga.model";
import { updateUserStatus } from "../../models/user.model";
import kafka from "../../startup/kafka";
import { Partitioners } from "kafkajs";

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});

const userVerificationSaga: Saga = {
  id: "user-verification",
  name: "User Verification",
  steps: [
    {
      name: SagaStepEventType.UpdateUserStatus,
      action: async (data) => {
        console.log("data -verify: ", data);
        const { token, email } = data;
        try {
          const user = await updateUserStatus(email, "Verified");
          console.log("user updated: ", user);
        } catch (error: any) {
          winston.error(`user-registration -> Verify User: ${error.message}`);
        }
      },
      compensation: async (data) => {
        try {
          await updateUserStatus(data.email, "Not Verified");
        } catch (error: any) {
          winston.error(
            `user-registration -> Verify User Compensation: ${error.message}`
          );
        }
      },
    },
    {
      name: SagaStepEventType.PublishUserVerifiedEvent,
      action: async (data) => {
        const { token, email } = data;
        try {
          await producer.connect();
          const event = {
            type: TopicNames.EmailVerified,
            email,
          };

          await producer.send({
            topic: TopicNames.EmailVerified,
            messages: [{ value: JSON.stringify(event) }],
          });
          await producer.disconnect();
        } catch (error: any) {
          winston.error(
            `user-registration -> Verified Email: ${error.message}`
          );
        }
      },

      compensation: async (data) => {},
    },
  ],
};

export { userVerificationSaga };
