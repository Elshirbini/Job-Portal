import { singleton } from "tsyringe";
import { Document as LangChainDocument } from "@langchain/core/documents";
import { QdrantVectorStoreService } from "../services/qdrantVectorStore.service";
import { qdrant, QDRANT_COLLECTION } from "../../config/qdrant.config";
import { RetrievalResult } from "../types/retrievalResult.type";

@singleton()
export class DocumentChunksRepository {
  constructor(
    private readonly qdrantVectorStoreService: QdrantVectorStoreService,
  ) {}

  async saveChunks(documents: LangChainDocument[]): Promise<void> {
    const vectorStore = await this.qdrantVectorStoreService.getVectorStore();
    await vectorStore.addDocuments(documents);
  }

  async searchSimilar(
    query: string,
    limit: number,
  ): Promise<RetrievalResult[]> {
    const vectorStore = await this.qdrantVectorStoreService.getVectorStore();
    const results = await vectorStore.similaritySearchWithScore(query, limit);

    return results.map(([document, score]) => ({
      content: document.pageContent,
      metadata: document.metadata,
      score,
    }));
  }

  async findChunksByDocumentId(documentId: string, limit = 100) {
    const response = await qdrant.scroll(QDRANT_COLLECTION, {
      filter: {
        must: [
          {
            key: "metadata.documentId",
            match: { value: documentId },
          },
        ],
      },
      limit,
      with_payload: true,
      with_vector: false,
    });

    return response.points;
  }

  async deleteChunksByDocumentId(documentId: string): Promise<void> {
    await qdrant.delete(QDRANT_COLLECTION, {
      filter: {
        must: [
          {
            key: "metadata.documentId",
            match: { value: documentId },
          },
        ],
      },
    });
  }
}
