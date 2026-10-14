import { injectable } from "tsyringe";
import { QdrantVectorStore } from "@langchain/qdrant";
import { EmbeddingService } from "../../ai/embedding.service";
import { qdrant, QDRANT_COLLECTION } from "../../config/qdrant.config";

@injectable()
export class QdrantVectorStoreService {
  private vectorStorePromise: Promise<QdrantVectorStore> | null = null;

  constructor(private readonly embeddingService: EmbeddingService) {}

  async getVectorStore(): Promise<QdrantVectorStore> {
    if (!this.vectorStorePromise) {
      this.vectorStorePromise = QdrantVectorStore.fromExistingCollection(
        this.embeddingService.getEmbeddings(),
        {
          client: qdrant,
          collectionName: QDRANT_COLLECTION,
        },
      ).catch((error: unknown) => {
        this.vectorStorePromise = null;
        throw error;
      });
    }

    return this.vectorStorePromise;
  }
}
