import { injectable } from "tsyringe";
import { Document as LangChainDocument } from "@langchain/core/documents";

import { DocumentChunkingService } from "./documentChunking.service";
import { DocumentRepository } from "../repositories/document.repository";
import { DocumentChunksRepository } from "../repositories/documentChunks.repository";

@injectable()
export class DocumentIngestionService {
  constructor(
    private readonly documentChunkingService: DocumentChunkingService,
    private readonly documentRepository: DocumentRepository,
    private readonly documentChunksRepository: DocumentChunksRepository,
  ) {}

  async ingestText(
    filename: string,
    content: string,
    mimeType = "text/plain",
  ): Promise<string> {
    const normalizedContent = content.trim();

    if (!filename.trim()) {
      throw new Error("Filename is required");
    }

    if (!normalizedContent) {
      throw new Error("Document content cannot be empty");
    }

    const document = await this.documentRepository.createDocument({
      filename,
      mimeType,
      status: "PROCESSING",
    });

    try {
      const chunks =
        await this.documentChunkingService.splitText(normalizedContent);

      const langChainDocuments = chunks.map(
        (content, chunkIndex) =>
          new LangChainDocument({
            pageContent: content,
            metadata: {
              documentId: document.id,
              filename,
              chunkIndex,
            },
          }),
      );

      await this.documentChunksRepository.saveChunks(langChainDocuments);

      await this.documentRepository.updateStatus(document.id, "COMPLETED");

      return document.id;
    } catch (error: unknown) {
      await this.documentRepository.updateStatus(document.id, "FAILED");

      throw error;
    }
  }
}

