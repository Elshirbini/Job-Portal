import { GoogleGenAI } from "@google/genai";
import { injectable } from "tsyringe";
import { ApiError } from "../utils/apiError";
import { logger } from "../config/logger";

@injectable()
export class EmbeddingService {
  private readonly gemini: GoogleGenAI;
  private readonly model: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_EMBEDDING_MODEL;

    if (!apiKey || !model) {
      throw new Error("Missing Gemini embedding configuration");
    }

    this.gemini = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  async embedText(text: string): Promise<number[]> {
    try {
      const response = await this.gemini.models.embedContent({
        model: this.model,
        contents: text,
      });

      const values = response.embeddings?.[0]?.values;

      if (!values?.length) {
        throw new ApiError("The embedding model returned an empty vector", 502);
      }

      return values;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      logger.error("Failed to generate embedding", {
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
              }
            : "Unknown error",
      });

      throw new ApiError("Embedding provider request failed", 502);
    }
  }
}
