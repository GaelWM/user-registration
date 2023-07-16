import config from "config";

export default () => {
  const port = config.get("port");
  const dbUri = config.get("dbUri");

  if (!port) {
    throw new Error("PORT must be provided");
  }

  if (!dbUri) {
    throw new Error("DB_URI must be provided");
  }
};
