import express, { Application, Request, Response } from "express";
import { UserController } from "../controllers/user.controller";
import { checkAuthToken } from "../middlewares/verify-token-middleware";
import { getUsers, getUser } from "../models/user.model";

export default (app: Application) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/", async (req: Request, res: Response) => {
    try {
      const users = await getUsers();
      res.send(users);
    } catch (error) {
      console.log(error);
    }
  });

  app.post("/auth/sign-up", async (req: Request, res: Response) => {
    try {
      const userController = new UserController();
      await userController.signUp(req, res);
    } catch (error) {
      console.log(error);
    }
  });

  app.get(
    "/auth/verify-user",
    [checkAuthToken],
    async (req: Request, res: Response) => {
      try {
        const { email } = req.query;
        const user = await getUser(email as string);
        if (user && user.toObject().status === "Verified") {
          res.status(400).send("User already verified.");
          return;
        }
        const userController = new UserController();
        await userController.verifyUser(req, res);
      } catch (error) {
        console.log(error);
      }
    }
  );
};
