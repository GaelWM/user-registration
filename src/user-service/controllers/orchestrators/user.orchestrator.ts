import winston from "winston";
import { Saga, SagaStepEventType, TopicNames } from "../../shared/saga.model";
import { SagaOrchestrator } from "../../shared/saga.orchestrator";
import { createUser, getUser, deleteUser } from "../../models/user.model";
import kafka from "../../startup/kafka";

const producer = kafka.producer();

const userRegistrationSaga: Saga = {
  id: "user-registration",
  name: "User Registration",
  steps: [
    {
      name: "Check if user exists",
      action: async (data: any) => {
        const { email } = data;
        const user = await getUser(email);
        if (user) {
          producer.send({
            topic: "UserExists",
            messages: [{ value: JSON.stringify(user) }],
          });
        }
      },
      compensation: async (data) => {
        // No compensation needed
      },
    },
    {
      name: "Create User",
      action: async (data) => {
        const { name, email, password } = data;
        try {
          const user = await createUser(name, email, password);
          if (user) {
            const event = {
              type: SagaStepEventType.UserCreated,
              userId: user._id,
              userDetails: user,
            };

            producer.send({
              topic: TopicNames.UserCreated,
              messages: [{ value: JSON.stringify(event) }],
            });
          }
        } catch (error: any) {
          winston.error(`user-registration -> Create User: ${error.message}`);
        }
      },
      compensation: async (data) => {
        // Perform the compensation action for creating a user
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

// Create the saga orchestrator
const userOrchestrator = new SagaOrchestrator();

// Register your sagas
userOrchestrator.registerSaga(userRegistrationSaga);

export { userOrchestrator };
