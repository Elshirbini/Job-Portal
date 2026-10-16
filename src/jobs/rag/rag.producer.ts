import { createChannel } from "../rabbitmq";
import { DocumentIngestionJob } from "../../rag/types/documentIngestionJob.type";

export const DOCUMENT_INGESTION_QUEUE = "document-ingestion-queue";

/**
 * Publishes a document ingestion job to RabbitMQ.
 * The consumer (rag.worker) will pick it up and process the file asynchronously.
 */
export const publishDocumentIngestionJob = async (
  job: DocumentIngestionJob,
): Promise<void> => {
  const channel = await createChannel();
  await channel.assertQueue(DOCUMENT_INGESTION_QUEUE, { durable: true });
  channel.sendToQueue(
    DOCUMENT_INGESTION_QUEUE,
    Buffer.from(JSON.stringify(job)),
    {
      persistent: true,
    },
  );
};
