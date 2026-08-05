import "reflect-metadata";
import app from "./app";
import dotenv from "dotenv";
import { logger } from "./config/logger";
import { prisma } from "./prisma";
dotenv.config();

async function start() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info("✅ Prisma connected to PostgreSQL successfully!");

    app.listen(8080, "0.0.0.0", () => {
      logger.info(`🚀 Server running on PORT:${process.env.PORT}`);
    });
  } catch (error) {
    logger.error("❌ Failed to connect to the database:", error);
    process.exit(1);
  }
}

start();

process.on("unhandledRejection", (err: Error) => {
  logger.error(`Unhandled Rejection Errors : ${err.name} | ${err.message}`);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error(`Unhandled Caught Errors : ${err.name} | ${err.message}`);
  process.exit(1);
});
