import "reflect-metadata";
import { container } from "tsyringe";
import { configDotenv } from "dotenv";
configDotenv();
import { DocumentRetrievalService } from "../services/documentRetrieval.service";

async function main(): Promise<void> {
  const retrievalService = container.resolve(DocumentRetrievalService);

  const results = await retrievalService.retrieve(
    "What services and features are available in the Saudi Arabia branch?",
    5,
  );

  console.log(
    JSON.stringify(
      {
        resultsCount: results.length,
        results,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  console.error("Retrieval test failed:", error);
  process.exitCode = 1;
});
