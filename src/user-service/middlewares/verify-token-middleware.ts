import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import config from "config";
import { TopicNames } from "../shared/saga.model";
import kafka from "../startup/kafka";
import { Partitioners } from "kafkajs";

export const checkAuthToken = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = <string>req.query.token;
  const email = <string>req.query.email;
  let jwtPayload: any;
  try {
    jwtPayload = <any>jwt.verify(token, config.get("jwtSecret"));
    res.locals.jwtPayload = jwtPayload;
    res.locals.email = jwtPayload["email"];
  } catch (error) {
    await publishEmailNotSentEvent(email);
    res.status(401).send("Token has expired.");
    return;
  }
  next();
};

const publishEmailNotSentEvent = async (email: string): Promise<void> => {
  const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
  });
  const event = {
    type: TopicNames.EmailVerificationFailed,
    email,
    message: "Email verification failed.",
  };

  await producer.connect();
  await producer.send({
    topic: TopicNames.EmailVerificationFailed,
    messages: [{ value: JSON.stringify(event) }],
  });
  await producer.disconnect();
};
