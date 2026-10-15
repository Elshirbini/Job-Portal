import { injectable } from "tsyringe";
import { QdrantVectorStoreService } from "./qdrantVectorStore.service";
import { RetrievalResult } from "../types/retrievalResult.type";

@injectable()
export class DocumentRetrievalService {
  constructor(
    private readonly qdrantVectorStoreService: QdrantVectorStoreService,
  ) {}

  async retrieve(query: string, limit = 5): Promise<RetrievalResult[]> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      throw new Error("Search query cannot be empty");
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
      throw new Error("Limit must be an integer between 1 and 20");
    }

    const vectorStore = await this.qdrantVectorStoreService.getVectorStore();

    const results = await vectorStore.similaritySearchWithScore(
      normalizedQuery,
      limit,
    );

    return results.map(([document, score]) => ({
      content: document.pageContent,
      metadata: document.metadata,
      score,
    }));
  }
}
