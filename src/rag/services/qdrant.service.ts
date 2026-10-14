import { qdrant, QDRANT_COLLECTION } from "../../config/qdrant.config";

export class QdrantService {
  async verifyConnection() {
    const result = await qdrant.collectionExists(QDRANT_COLLECTION);

    if (!result.exists) {
      throw new Error(
        `Qdrant collection "${QDRANT_COLLECTION}" does not exist`,
      );
    }

    const collection = await qdrant.getCollection(QDRANT_COLLECTION);

    const info = {
      collection: QDRANT_COLLECTION,
      pointsCount: collection.points_count,
      status: collection.status,
      vectorConfig: collection.config.params.vectors,
    };

    console.log("Qdrant connection verified", info);

    return info;
  }
}
