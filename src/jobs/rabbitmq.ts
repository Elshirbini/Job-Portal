import amqp, { Channel } from "amqplib";
import { logger } from "../config/logger";
import { configDotenv } from "dotenv";
configDotenv();

export const createChannel = async (): Promise<Channel> => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL!);
  const channel = await connection.createChannel();
  logger.info("RabbitMQ connected");
  return channel;
};
