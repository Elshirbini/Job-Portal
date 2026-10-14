import { injectable } from "tsyringe";
import { AIService } from "./ai.service";
import { Request, Response } from "express";
import { success } from "../utils/response";
import { EmbeddingService } from "./embedding.service";

@injectable()
export class AIController {
  constructor(private aiService: AIService) {}
  async generate(req: Request, res: Response) {
    const { prompt } = req.body;

    const result = await this.aiService.generateText(prompt);

    return success(res, 200, {
      text: result,
    });
  }

  async analyzeCandidate(req: Request, res: Response) {
    const { candidate, jobDescription } = req.body;

    const result = await this.aiService.analyzeCandidate(
      candidate,
      jobDescription,
    );

    return success(res, 200, {
      analysis: result,
    });
  }

  async answerOrderQuestion(req: Request, res: Response) {
    const { prompt } = req.body;
    const userId = "user-1";

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await this.aiService.answerOrderQuestion(prompt, userId);

    return success(res, 200, {
      answer: result,
    });
  }

  async compareTexts(req: Request, res: Response) {
    const { text1, text2 } = req.body;

    const result = await this.aiService.compareTexts(text1, text2);

    return success(res, 200, result);
  }
}
