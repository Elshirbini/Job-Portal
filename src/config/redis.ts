import { createClient } from "redis";
import { logger } from "./logger";
import { configDotenv } from "dotenv";
configDotenv();

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
  password: process.env.REDIS_PASS,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

redisClient.connect();

logger.info("Connected to Redis");

export default redisClient;
