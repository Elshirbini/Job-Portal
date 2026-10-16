import { injectable } from "tsyringe";
import { Document as LangChainDocument } from "@langchain/core/documents";

import { DocumentChunkingService } from "./documentChunking.service";
import { DocumentRepository } from "../repositories/document.repository";
import { DocumentChunksRepository } from "../repositories/documentChunks.repository";
import { ApiError } from "../../utils/apiError";
import { DocumentIngestionJob } from "../types/documentIngestionJob.type";
import { publishDocumentIngestionJob } from "../../jobs/rag/rag.producer";

@injectable()
export class DocumentIngestionService {
  constructor(
    private readonly documentChunkingService: DocumentChunkingService,
    private readonly documentRepository: DocumentRepository,
    private readonly documentChunksRepository: DocumentChunksRepository,
  ) {}

  /**
   * Called by the controller.
   *
   * 1. Guards against duplicate submissions (same filename already COMPLETED).
   * 2. Creates a PENDING document record in PostgreSQL.
   * 3. Publishes an ingestion job to RabbitMQ and returns immediately.
   *
   * @returns The newly created document id.
   */
  async enqueue(
    filename: string,
    content: string,
    mimeType = "text/plain",
  ): Promise<string> {
    if (!filename.trim()) {
      throw new ApiError("Filename is required.", 400);
    }

    if (!content.trim()) {
      throw new ApiError("Document content cannot be empty.", 422);
    }

    // Deduplication guard — reject if an identical file was already indexed
    const existing = await this.documentRepository.findDocumentByFilenameAndStatus(
      filename,
      "COMPLETED",
    );

    if (existing) {
      throw new ApiError(
        `A document with filename "${filename}" has already been indexed (id: ${existing.id}).`,
        409,
      );
    }

    // Persist a PENDING record so the UI can poll status
    const document = await this.documentRepository.createDocument({
      filename,
      mimeType,
      status: "PENDING",
    });

    // Publish to MQ — the worker will handle the heavy lifting asynchronously
    const job: DocumentIngestionJob = {
      documentId: document.id,
      filename,
      content,
      mimeType,
    };

    await publishDocumentIngestionJob(job);

    return document.id;
  }

  /**
   * Called by the RabbitMQ worker (rag.worker.ts).
   *
   * Runs the full ingestion pipeline:
   *   1. Split text into chunks
   *   2. Embed each chunk and store in Qdrant (deduplication: delete existing chunks first)
   *   3. Mark the document COMPLETED (or FAILED on error)
   */
  async processDocument(job: DocumentIngestionJob): Promise<void> {
    const { documentId, filename, content } = job;

    // Update status to PROCESSING before starting
    await this.documentRepository.updateStatus(documentId, "PROCESSING");

    try {
      // Step 1: chunking
      const chunks = await this.documentChunkingService.splitText(content.trim());

      // Step 2: deduplication — remove any existing vectors for this document
      // so re-processing (e.g. after a prior FAILED attempt) never duplicates chunks
      await this.documentChunksRepository.deleteChunksByDocumentId(documentId);

      // Step 3: embed + store in Qdrant
      const langChainDocuments = chunks.map(
        (chunkContent, chunkIndex) =>
          new LangChainDocument({
            pageContent: chunkContent,
            metadata: {
              documentId,
              filename,
              chunkIndex,
            },
          }),
      );

      await this.documentChunksRepository.saveChunks(langChainDocuments);

      // Step 4: mark as completed
      await this.documentRepository.updateStatus(documentId, "COMPLETED");
    } catch (error: unknown) {
      // Always persist the failure so consumers can inspect it
      await this.documentRepository.updateStatus(documentId, "FAILED");
      throw error;
    }
  }
}
