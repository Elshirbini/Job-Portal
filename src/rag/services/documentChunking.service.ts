import { injectable } from "tsyringe";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

@injectable()
export class DocumentChunkingService {
  private readonly splitter: RecursiveCharacterTextSplitter;

  constructor() {
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 100,
      chunkOverlap: 20,
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
