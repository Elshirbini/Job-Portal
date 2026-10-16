import { injectable } from "tsyringe";
import { Request, Response } from "express";
import { DocumentIngestionService } from "./services/documentIngestion.service";
import { DocumentRetrievalService } from "./services/documentRetrieval.service";
import { DocumentRepository } from "./repositories/document.repository";
import { AIService } from "../ai/ai.service";
import { success } from "../utils/response";
import { ApiError } from "../utils/apiError";

@injectable()
export class RagController {
  constructor(
    private readonly documentIngestionService: DocumentIngestionService,
    private readonly documentRetrievalService: DocumentRetrievalService,
    private readonly documentRepository: DocumentRepository,
    private readonly aiService: AIService,
  ) {}

  /**
   * POST /api/v1/rag/documents
   *
   * Accepts a single .txt file (multipart/form-data, field name: "file").
   *
   * Flow:
   *   1. Validate file (done by validateTextFile middleware)
   *   2. Deduplication check — 409 if already indexed
   *   3. Persist a PENDING document record in PostgreSQL
   *   4. Publish an ingestion job to RabbitMQ → return 202 immediately
   *
   * The actual chunking + embedding happens asynchronously in rag.worker.ts.
   *
   * Response: 202 { documentId, filename, message }
   */
  async ingestTextFile(req: Request, res: Response): Promise<void> {
    const file = req.file!; // guaranteed by validateTextFile middleware

    const filename = file.originalname.trim();
    const content = file.buffer.toString("utf-8");

    if (!content.trim()) {
      throw new ApiError("The uploaded file is empty.", 422);
    }

    const documentId = await this.documentIngestionService.enqueue(
      filename,
      content,
      file.mimetype,
    );

    success(res, 202, {
      documentId,
      filename,
      message:
        "File accepted and queued for indexing. Poll /api/v1/rag/documents/:id for status.",
    });
  }

  /**
   * GET /api/v1/rag/documents/:id
   *
   * Returns the current processing status of a previously submitted document.
   *
   * Response: 200 { id, filename, status, createdAt, updatedAt }
   */
  async getDocumentStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const document = await this.documentRepository.findDocumentById(id);

    if (!document) {
      throw new ApiError(`Document with id "${id}" not found.`, 404);
    }

    success(res, 200, {
      id: document.id,
      filename: document.filename,
      status: document.status,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  /**
   * POST /api/v1/rag/chat
   *
   * AI chatbot endpoint that answers questions strictly grounded on
   * the indexed documents stored in the vector store.
   *
   * Flow:
   *   1. Embed the user's query
   *   2. Retrieve the top-k most relevant chunks from Qdrant
   *   3. Feed chunks as context to Gemini with a strict RAG system prompt
   *   4. Return the AI answer + the source chunks used
   *
   * Body:
   *   query  – required – natural-language question (max 1000 chars)
   *   limit  – optional – number of context chunks to retrieve (1-20, default 5)
   *
   * Response: 200 { answer: string, sources: RetrievalResult[] }
   */
  async chat(req: Request, res: Response): Promise<void> {
    const query: string = req.body.query.trim();
    const limit: number = req.body.limit ?? 5;

    // Step 1 & 2: semantic search → retrieve relevant chunks
    const sources = await this.documentRetrievalService.retrieve(query, limit);

    // Step 3: generate a grounded AI answer from those chunks
    const answer = await this.aiService.answerWithContext(query, sources);

    // Step 4: return answer + source transparency
    success(res, 200, {
      answer,
      sources,
    });
  }
}
