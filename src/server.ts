import app from "./app";
import dotenv from "dotenv";
import { dbConnection } from "./config/dbConnection";
import { errorLogger } from "./config/logger";
dotenv.config();

app.listen(8080, "0.0.0.0", () => {
  dbConnection();
  console.log(`🚀 Server running on PORT:${process.env.PORT}`);
});

process.on("unhandledRejection", (err: Error) => {
  errorLogger.error(
    `Unhandled Rejection Errors : ${err.name} | ${err.message}`
  );
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  errorLogger.error(`Unhandled Caught Errors : ${err.name} | ${err.message}`);
  process.exit(1);
});
