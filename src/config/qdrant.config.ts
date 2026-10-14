import { QdrantClient } from "@qdrant/js-client-rest";

const url = process.env.QDRANT_URL;
const apiKey = process.env.QDRANT_API_KEY;

if (!url || !apiKey) {
  throw new Error("Qdrant credentials are missing");
}

export const qdrant = new QdrantClient({
  url,
  apiKey,
});

export const QDRANT_COLLECTION =
  process.env.QDRANT_COLLECTION ?? "document_chunks";
