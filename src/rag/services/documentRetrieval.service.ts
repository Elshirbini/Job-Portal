import { injectable } from "tsyringe";
import { DocumentChunksRepository } from "../repositories/documentChunks.repository";
import { RetrievalResult } from "../types/retrievalResult.type";

@injectable()
export class DocumentRetrievalService {
  constructor(
    private readonly documentChunksRepository: DocumentChunksRepository,
  ) {}

  async retrieve(query: string, limit = 5): Promise<RetrievalResult[]> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      throw new Error("Search query cannot be empty");
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
      throw new Error("Limit must be an integer between 1 and 20");
    }

    return this.documentChunksRepository.searchSimilar(normalizedQuery, limit);
  }
}

