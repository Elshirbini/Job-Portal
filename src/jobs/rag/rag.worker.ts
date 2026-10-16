import "reflect-metadata";
import { container } from "tsyringe";
import { logger } from "../../config/logger";
import { createChannel } from "../rabbitmq";
import { DOCUMENT_INGESTION_QUEUE } from "./rag.producer";
import { DocumentIngestionService } from "../../rag/services/documentIngestion.service";
import { DocumentIngestionJob } from "../../rag/types/documentIngestionJob.type";

class RagWorker {
  async start(): Promise<void> {
    const channel = await createChannel();

    await channel.assertQueue(DOCUMENT_INGESTION_QUEUE, { durable: true });
    channel.prefetch(1);

    logger.info("🤖 RAG ingestion worker started…");

    channel.consume(DOCUMENT_INGESTION_QUEUE, async (msg) => {
      if (!msg) return;

      let job: DocumentIngestionJob | null = null;

      try {
        job = JSON.parse(msg.content.toString()) as DocumentIngestionJob;

        logger.info("RAG worker: processing document", {
          documentId: job.documentId,
          filename: job.filename,
        });

        const ingestionService = container.resolve(DocumentIngestionService);

        await ingestionService.processDocument(job);

        channel.ack(msg);

        logger.info("RAG worker: document ingested successfully", {
          documentId: job.documentId,
        });
      } catch (error: unknown) {
        logger.error("RAG worker: document ingestion failed", {
          documentId: job?.documentId,
          error:
            error instanceof Error
              ? { name: error.name, message: error.message }
              : "Unknown error",
        });

        // Dead-letter: do not requeue — the document status is already FAILED in the DB
        channel.nack(msg, false, false);
      }
    });
  }
}

// Bootstrap
const worker = new RagWorker();
worker.start();
