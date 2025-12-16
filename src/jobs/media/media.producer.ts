import { getChannel } from "../rabbitmq";

export const addMediaJob = async (postData: any) => {
  const channel = await getChannel();
  await channel.assertQueue("media-queue", { durable: true });
  channel.sendToQueue("media-queue", Buffer.from(JSON.stringify(postData)), {
    persistent: true,
  });
};
