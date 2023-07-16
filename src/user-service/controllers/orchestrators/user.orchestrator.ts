import winston from "winston";
import { Saga, SagaStepEventType, TopicNames } from "../../shared/saga.model";
import { createUser, deleteUser } from "../../models/user.model";
import kafka from "../../startup/kafka";
import { Partitioners } from "kafkajs";

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});

const userRegistrationSaga: Saga = {
  id: "user-registration",
  name: "User Registration",
  steps: [
    {
      name: SagaStepEventType.CreateUser,
      action: async (data) => {
        const { name, email, password } = data;
        try {
          const user = await createUser(name, email, password);
          if (user) {
            await producer.connect();
            const event = {
              type: TopicNames.UserCreated,
              userId: user._id,
              userDetails: user,
            };

            await producer.send({
              topic: TopicNames.UserCreated,
              messages: [{ value: JSON.stringify(event) }],
            });
            await producer.disconnect();
          }
        } catch (error: any) {
          winston.error(`user-registration -> Create User: ${error.message}`);
        }
      },
      compensation: async (data) => {
        try {
          await deleteUser(data.email);
        } catch (error: any) {
          winston.error(
            `user-registration -> Create User Compensation: ${error.message}`
          );
        }
      },
    },
  ],
};

export { userRegistrationSaga };
