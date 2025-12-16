import { configDotenv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { logger } from "./config/logger";
configDotenv();
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({
  adapter,
  log: ["info", "warn", "error"],
});

logger.info("Prisma Client has been initialized.");
