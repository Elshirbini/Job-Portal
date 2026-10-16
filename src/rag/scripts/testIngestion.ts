/**
 * testIngestion.ts
 *
 * End-to-end test for the async ingestion pipeline.
 *
 * Run:
 *   1. In terminal A: npm run worker:rag
 *   2. In terminal B: ts-node src/rag/scripts/testIngestion.ts
 *
 * The script calls processDocument() directly (bypassing MQ) so you can
 * run it without a live RabbitMQ broker in local dev/CI environments.
 */
import "reflect-metadata";
import { container } from "tsyringe";
import { configDotenv } from "dotenv";

configDotenv();

import { DocumentIngestionService } from "../services/documentIngestion.service";
import { DocumentRepository } from "../repositories/document.repository";
import { DocumentChunksRepository } from "../repositories/documentChunks.repository";
import { qdrant, QDRANT_COLLECTION } from "../../config/qdrant.config";
import { prisma } from "../../prisma";

async function ensureDocumentIdIndex(): Promise<void> {
  await qdrant.createPayloadIndex(QDRANT_COLLECTION, {
    field_name: "metadata.documentId",
    field_schema: "keyword",
    wait: true,
  });
}

async function main(): Promise<void> {
  await ensureDocumentIdIndex();

  const ingestionService = container.resolve(DocumentIngestionService);
  const documentRepository = container.resolve(DocumentRepository);
  const documentChunksRepository = container.resolve(DocumentChunksRepository);

  const filename = `rag-test-${Date.now()}.txt`;
  const mimeType = "text/plain";

  const content = `
PostgreSQL indexes improve query performance by reducing the amount of data scanned.
Indexes are useful for frequently queried columns, but they introduce storage overhead.

Redis is an in-memory data store commonly used for caching.
Caching can reduce database load and improve response times.

RabbitMQ is a message broker used for asynchronous communication.
It helps services communicate without requiring both services to be available at the same time.
`;

  // Step 1: create the PENDING record (same as what enqueue() does before publishing to MQ)
  const document = await documentRepository.createDocument({
    filename,
    mimeType,
    status: "PENDING",
  });

  const pointsBefore = await qdrant.getCollection(QDRANT_COLLECTION);

  // Step 2: run the worker pipeline directly (without MQ)
  await ingestionService.processDocument({
    documentId: document.id,
    filename,
    content,
    mimeType,
  });

  // Step 3: verify
  const updatedDocument = await documentRepository.findDocumentByIdOrThrow(
    document.id,
  );

  const points = await documentChunksRepository.findChunksByDocumentId(
    document.id,
    100,
  );

  const pointsAfter = await qdrant.getCollection(QDRANT_COLLECTION);

  console.log(
    JSON.stringify(
      {
        document: {
          id: updatedDocument.id,
          filename: updatedDocument.filename,
          status: updatedDocument.status,
        },
        chunksStored: points.length,
        totalPointsBefore: pointsBefore.points_count,
        totalPointsAfter: pointsAfter.points_count,
        samplePayload: points[0]?.payload,
      },
      null,
      2,
    ),
  );

  if (updatedDocument.status !== "COMPLETED") {
    throw new Error(`Expected COMPLETED but got ${updatedDocument.status}`);
  }

  if (points.length === 0) {
    throw new Error("No Qdrant points were found for the ingested document");
  }

  console.log("✅ Ingestion test passed");
}

main()
  .catch((error: unknown) => {
    console.error("Ingestion test failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
