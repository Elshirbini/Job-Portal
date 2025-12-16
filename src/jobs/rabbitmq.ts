import amqp, { Connection, Channel, ChannelModel } from "amqplib";
import { logger } from "../config/logger";

let connection: Connection | ChannelModel;
let channel: Channel;

export const getChannel = async () => {
  if (channel) return channel;
  connection = await amqp.connect(
    "amqps://yzajxsri:41DsSToHQU29JmWN_Lb93eogksTtf6VI@leopard.lmq.cloudamqp.com/yzajxsri"
  );
  channel = await connection.createChannel();
  logger.info("RabbitMQ connected successfully!");
  return channel;
};
