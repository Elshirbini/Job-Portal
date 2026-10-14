import "reflect-metadata";
import { container } from "tsyringe";
import { prisma } from "../../prisma";
import { DocumentIngestionService } from "../services/documentIngestion.service";
import { qdrant, QDRANT_COLLECTION } from "../../config/qdrant.config";

async function main(): Promise<void> {
  await ensureDocumentIdIndex();
  const ingestionService = container.resolve(DocumentIngestionService);

  const filename = `rag-test-${Date.now()}.txt`;

  const content = `
PostgreSQL indexes improve query performance by reducing the amount of data scanned.
Indexes are useful for frequently queried columns, but they introduce storage overhead.

Redis is an in-memory data store commonly used for caching.
Caching can reduce database load and improve response times.

RabbitMQ is a message broker used for asynchronous communication.
It helps services communicate without requiring both services to be available at the same time.
`;

  const pointsBefore = await qdrant.getCollection(QDRANT_COLLECTION);

  const documentId = await ingestionService.ingestText(filename, content);

  const document = await prisma.document.findUniqueOrThrow({
    where: { id: documentId },
  });

  const points = await qdrant.scroll(QDRANT_COLLECTION, {
    filter: {
      must: [
        {
          key: "metadata.documentId",
          match: { value: documentId },
        },
      ],
    },
    limit: 100,
    with_payload: true,
    with_vector: false,
  });

  const pointsAfter = await qdrant.getCollection(QDRANT_COLLECTION);

  console.log(
    JSON.stringify(
      {
        document: {
          id: document.id,
          filename: document.filename,
          status: document.status,
        },
        chunksStored: points.points.length,
        totalPointsBefore: pointsBefore.points_count,
        totalPointsAfter: pointsAfter.points_count,
        samplePayload: points.points[0]?.payload,
      },
      null,
      2,
    ),
  );

  if (document.status !== "COMPLETED") {
    throw new Error("Document ingestion did not complete");
  }

  if (points.points.length === 0) {
    throw new Error("No Qdrant points were found for the ingested document");
  }
}
async function ensureDocumentIdIndex(): Promise<void> {
  await qdrant.createPayloadIndex(QDRANT_COLLECTION, {
    field_name: "metadata.documentId",
    field_schema: "keyword",
    wait: true,
  });
}
main()
  .catch((error: unknown) => {
    console.error("Ingestion test failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
