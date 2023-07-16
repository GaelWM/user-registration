import config from "config";
import mongoose from "mongoose";
import winston from "winston";

export default async () => {
  await mongoose
    .connect(config.get("dbUri"))
    .then(() => {
      console.log(`Connected to ${config.get("dbUri")}...`);
      winston.info(`Connected to ${config.get("dbUri")}...`);
    })
    .catch((err) => {
      console.log(err.message);
      winston.error(err.message);
    });
};
