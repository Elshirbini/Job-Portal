import { injectable } from "tsyringe";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

@injectable()
export class EmbeddingService {
  private readonly embeddings: GoogleGenerativeAIEmbeddings;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY configuration");
    }

    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey,
      model: "gemini-embedding-001",
      outputDimensionality: 768,
    });
  }

  async embedText(text: string): Promise<number[]> {
    return this.embeddings.embedQuery(text);
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    return this.embeddings.embedDocuments(texts);
  }

  getEmbeddings(): GoogleGenerativeAIEmbeddings {
    return this.embeddings;
  }
}
