import { Request, Response } from "express";
import winston from "winston";
import Joi from "joi";
import { userRegistrationSaga } from "./orchestrators/user.orchestrator";
import { getUser } from "../models/user.model";
import { userVerificationSaga } from "./orchestrators/user-verification.orchestrator";
import { SagaOrchestrator } from "../shared/saga.orchestrator";

export class UserController {
  saga: SagaOrchestrator = new SagaOrchestrator();

  constructor() {
    this.saga.registerSaga(userVerificationSaga);
    this.saga.registerSaga(userRegistrationSaga);
  }

  public signUp = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    try {
      const { error } = this.validateRequest(req.body);
      if (error) return res.status(400).send(error.details[0].message);

      const user = await getUser(email);
      if (user != null) {
        res.status(400).send("User already exists.");
        return;
      }
      await this.saga.executeSaga("user-registration", {
        name,
        email,
        password,
      });
      res.status(201).send("User created successfully.");
    } catch (error: any) {
      winston.error(`user-service -> signUp: ${error.message}`);
      res.status(500).send(error.message);
    }
  };

  public verifyUser = async (req: Request, res: Response) => {
    const { email, token } = req.query;
    try {
      await this.saga.executeSaga("user-verification", {
        email,
        token,
      });
      res.status(200).send("User verified successfully.");
    } catch (error: any) {
      winston.error(`user-service -> verifyUser: ${error.message}`);
      res.status(500).send(error.message);
    }
  };

  public validateRequest = (payload: Record<string, unknown>) => {
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
    }).options({ allowUnknown: true });

    return schema.validate(payload);
  };
}
