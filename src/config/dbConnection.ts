import { connect } from "mongoose";
import { errorLogger } from "./logger";

export const dbConnection = async () => {
  try {
    await connect(process.env.DB_URL!, {
      serverSelectionTimeoutMS: 50000,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    errorLogger.error(`Error connecting to MongoDB: ${error}`);
    throw error;
  }
};
