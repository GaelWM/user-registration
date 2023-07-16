import { Request, Response } from "express";
import winston from "winston";
import { userOrchestrator } from "./orchestrators/user.orchestrator";

export class UserController {
  public static signUp = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    try {
      await userOrchestrator.executeSaga("user-registration", {
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

  public static verifyUser = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
      await userOrchestrator.executeSaga("user-verification", { email });
      res.status(200).send("User verified successfully.");
    } catch (error: any) {
      winston.error(`user-service -> verifyUser: ${error.message}`);
      res.status(500).send(error.message);
    }
  };
}
