import { getChannel } from "../rabbitmq";
import { processMedia } from "../../services/mediaProcessing.service";

const startMediaWorker = async () => {
  const channel = await getChannel();
  await channel.assertQueue("media-queue", { durable: true });

  channel.consume("media-queue", async (msg) => {
    if (msg) {
      const mediaJob = JSON.parse(msg.content.toString());
      await processMedia(mediaJob);
      channel.ack(msg);
    }
  });
};

startMediaWorker();
