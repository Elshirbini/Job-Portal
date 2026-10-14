import "reflect-metadata";
import { container } from "tsyringe";
import { EmbeddingService } from "../../ai/embedding.service";
import { configDotenv } from "dotenv";
configDotenv();
async function main(): Promise<void> {
  const embeddingService = container.resolve(EmbeddingService);

  const vector = await embeddingService.embedText(
    "PostgreSQL indexes improve query performance.",
  );

  console.log({
    dimensions: vector.length,
    isValid: vector.length === 768,
    sample: vector.slice(0, 5),
  });

  if (vector.length !== 768) {
    throw new Error(
      `Expected 768 dimensions, received ${vector.length}`,
    );
  }
}

main().catch((error: unknown) => {
  console.error("Embedding test failed:", error);
  process.exitCode = 1;
});
