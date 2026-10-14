import "reflect-metadata";
import { container } from "tsyringe";
import { DocumentChunkingService } from "../services/documentChunking.service";

async function main(): Promise<void> {
  const chunkingService = container.resolve(DocumentChunkingService);

  const text = `
PostgreSQL indexes improve query performance by reducing the amount of data scanned.

Redis is commonly used for caching frequently accessed data and reducing database load.

RabbitMQ is a message broker that enables asynchronous communication between distributed services.
`;

  const chunks = await chunkingService.splitText(text);

  console.log(`Chunks count: ${chunks.length}`);

  chunks.forEach((chunk, index) => {
    console.log(`\n--- Chunk ${index + 1} ---`);
    console.log(chunk);
  });
}

main().catch((error: unknown) => {
  console.error("Chunking test failed:", error);
  process.exitCode = 1;
});
