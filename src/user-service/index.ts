import express from "express";
import configCheck from "./startup/config-check";
import config from "config";
import db from "./startup/db";
import logger from "./startup/logger";
import routes from "./startup/routes";

const app = express();

configCheck();
logger();
db();
routes(app);

const PORT = process.env.PORT || config.get("port") || 3000;
app.listen(PORT, async () => {
  console.log(`Listening on port ${PORT}`);
});
