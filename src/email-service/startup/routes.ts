import express, { Application } from "express";
import { getEmails } from "../models/email-mgt.model";

export default (app: Application) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/", async (req, res) => {
    try {
      const emails = await getEmails();
      res.send(emails);
    } catch (error: any) {
      console.log(error);
      res.status(500).send("Could not get emails");
    }
  });
};
