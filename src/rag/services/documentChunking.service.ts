import { injectable } from "tsyringe";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

@injectable()
export class DocumentChunkingService {
  private readonly splitter: RecursiveCharacterTextSplitter;

  constructor() {
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ["\n\n", "\n", " ", ""],
    });
  }

  async splitText(text: string): Promise<string[]> {
    const normalizedText = text.trim();

    if (!normalizedText) {
      return [];
    }

    return this.splitter.splitText(normalizedText);
  }
}
