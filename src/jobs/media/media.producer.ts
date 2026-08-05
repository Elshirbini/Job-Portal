import { createChannel } from "../rabbitmq";

export const addMediaJob = async (postData: any) => {
  const channel = await createChannel();
  await channel.assertQueue("media-queue", { durable: true });
  channel.sendToQueue("media-queue", Buffer.from(JSON.stringify(postData)), {
    persistent: true,
    headers: { "x-retries": 3 },
  });
};
