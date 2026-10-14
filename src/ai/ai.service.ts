import { GoogleGenAI, Type } from "@google/genai";
import { singleton } from "tsyringe";
import { ApiError } from "../utils/apiError";
import { logger } from "../config/logger";
import { CandidateAnalysis, candidateAnalysisSchema } from "./ai.schema";
import { AIToolService } from "./ai.tool.service";
import { getOrderStatusDeclaration } from "./ai.tools";
import { ORDER_ASSISTANT_INSTRUCTION } from "./prompts/order-assistant.prompt";
import { GENERAL_ASSISTANT_INSTRUCTION } from "./prompts/general-assistant.prompt";
import { activeCandidateAnalysisPrompt } from "./prompts/candidate-analysis";
import { cosineSimilarity } from "../utils/cosine-similarity";
import { EmbeddingService } from "./embedding.service";

@singleton()
export class AIService {
  private readonly gemini: GoogleGenAI;
  private apiKey = process.env.GEMINI_API_KEY;
  private model = process.env.GEMINI_MODEL!;
  constructor(
    private aiToolService: AIToolService,
    private embeddingService: EmbeddingService,
  ) {
    if (!this.apiKey) {
      throw new ApiError(
        "GEMINI_API_KEY is not set in environment variables",
        500,
      );
    }
    if (!this.model) {
      throw new ApiError(
        "GEMINI_MODEL is not set in environment variables",
        500,
      );
    }
    this.gemini = new GoogleGenAI({
      apiKey: this.apiKey,
      httpOptions: {
        timeout: 15_000,
      },
    });
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await this.gemini.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          systemInstruction: GENERAL_ASSISTANT_INSTRUCTION,
          maxOutputTokens: 512,
        },
      });

      const text = response.text?.trim();

      if (!text) {
        logger.warn("AI provider returned an empty response");
        throw new ApiError("The AI model returned an empty response", 502);
      }

      return text;
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        throw error;
      }

      logger.error("AI provider request failed", {
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
              }
            : "Unknown error",
      });

      throw new ApiError("AI provider request failed", 502);
    }
  }

  async analyzeCandidate(
    candidate: string,
    jobDescription: string,
  ): Promise<CandidateAnalysis> {
    try {
      const prompt = activeCandidateAnalysisPrompt.instruction;
      const response = await this.gemini.models.generateContent({
        model: this.model,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: JSON.stringify({
                  task: "Analyze the candidate against the job description.",
                  jobDescription,
                  candidate,
                }),
              },
            ],
          },
        ],
        config: {
          systemInstruction: prompt,
          maxOutputTokens: 512,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchScore: {
                type: Type.INTEGER,
                description: "Estimated match score from 0 to 100",
              },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              missingSkills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              recommendation: {
                type: Type.STRING,
                enum: ["strong_match", "potential_match", "poor_match"],
              },
            },
            required: [
              "matchScore",
              "strengths",
              "missingSkills",
              "recommendation",
            ],
            propertyOrdering: [
              "matchScore",
              "strengths",
              "missingSkills",
              "recommendation",
            ],
          },
        },
      });

      const text = response.text?.trim();

      if (!text) {
        throw new ApiError("The AI model returned an empty response", 502);
      }

      let parsedJson: unknown;

      try {
        parsedJson = JSON.parse(text);
      } catch {
        throw new ApiError("The AI provider returned invalid JSON", 502);
      }

      const validation = candidateAnalysisSchema.safeParse(parsedJson);

      if (!validation.success) {
        logger.error("AI response failed schema validation", {
          issues: validation.error.issues,
        });

        throw new ApiError(
          "The AI provider returned an invalid response structure",
          502,
        );
      }

      return validation.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      logger.error("AI candidate analysis failed", {
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
              }
            : "Unknown error",
      });

      throw new ApiError("AI provider request failed", 502);
    }
  }

  async answerOrderQuestion(prompt: string, userId: string): Promise<string> {
    try {
      const response = await this.gemini.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          tools: [
            {
              functionDeclarations: [getOrderStatusDeclaration],
            },
          ],
          maxOutputTokens: 512,
        },
      });

      const functionCalls = response.functionCalls ?? [];

      // Gemini may answer without calling a tool.
      if (functionCalls.length === 0) {
        const text = response.text?.trim();

        if (!text) {
          throw new ApiError("Empty AI response", 502);
        }

        return text;
      }

      // This example supports exactly one tool call.
      if (
        functionCalls.length !== 1 ||
        functionCalls[0].name !== "getOrderStatus"
      ) {
        throw new ApiError("Unsupported tool call", 502);
      }

      const functionCall = functionCalls[0];

      const result = await this.aiToolService.getOrderStatus(
        functionCall.args,
        userId,
      );

      const modelContent = response.candidates?.[0]?.content;

      if (!modelContent) {
        throw new ApiError("Missing tool-call context", 502);
      }

      const finalResponse = await this.gemini.models.generateContent({
        model: this.model,
        contents: [
          { role: "user", parts: [{ text: prompt }] },
          modelContent,
          {
            role: "user",
            parts: [
              {
                functionResponse: {
                  name: "getOrderStatus",
                  response: { result },
                },
              },
            ],
          },
        ],
        config: {
          systemInstruction: ORDER_ASSISTANT_INSTRUCTION,
          maxOutputTokens: 512,
        },
      });

      const text = finalResponse.text?.trim();

      if (!text) {
        throw new ApiError("Empty AI response", 502);
      }

      return text;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      logger.error("Order assistant failed", {
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
              }
            : "Unknown error",
      });

      throw new ApiError("AI request failed", 502);
    }
  }

  async compareTexts(text1: string, text2: string) {
    const [vector1, vector2] = await Promise.all([
      this.embeddingService.embedText(text1),
      this.embeddingService.embedText(text2),
    ]);

    const similarity = cosineSimilarity(vector1, vector2);

    return {
      similarity: Number(similarity.toFixed(4)),
    };
  }
}
