import { injectable } from "tsyringe";
import { Document as LangChainDocument } from "@langchain/core/documents";

import { prisma } from "../../prisma";
import { DocumentChunkingService } from "./documentChunking.service";
import { QdrantVectorStoreService } from "./qdrantVectorStore.service";

@injectable()
export class DocumentIngestionService {
  constructor(
    private readonly documentChunkingService: DocumentChunkingService,
    private readonly qdrantVectorStoreService: QdrantVectorStoreService,
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

    const document = await prisma.document.create({
      data: {
        filename,
        mimeType,
        status: "PROCESSING",
      },
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

      const vectorStore = await this.qdrantVectorStoreService.getVectorStore();

      await vectorStore.addDocuments(langChainDocuments);

      await prisma.document.update({
        where: { id: document.id },
        data: { status: "COMPLETED" },
      });

      return document.id;
    } catch (error: unknown) {
      await prisma.document.update({
        where: { id: document.id },
        data: { status: "FAILED" },
      });

      throw error;
    }
  }
}
