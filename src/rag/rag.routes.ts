import express from "express";
import { container } from "tsyringe";
import { RagController } from "./rag.controller";
import { upload } from "../config/multerMemory";
import { chatValidation, validateTextFile } from "./rag.validation";
import { validateInputs } from "../middlewares/validateInputs";

const router = express.Router();

const ragController = container.resolve(RagController);

/**
 * POST /api/v1/rag/documents
 *
 * Ingests a plain-text (.txt) file into the RAG vector store asynchronously.
 * The file is validated, a PENDING record is created in PostgreSQL,
 * then an ingestion job is published to RabbitMQ.
 *
 * Request  : multipart/form-data  { file: <text/plain, max 1 MB> }
 * Response : 202 { documentId, filename, message }
 */
router.post(
  "/documents",
  upload.single("file"),
  validateTextFile,
  ragController.ingestTextFile.bind(ragController),
);

/**
 * GET /api/v1/rag/documents/:id
 *
 * Polls the processing status of a submitted document.
 *
 * Response : 200 { id, filename, status, createdAt, updatedAt }
 *   status : "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
 */
router.get(
  "/documents/:id",
  ragController.getDocumentStatus.bind(ragController),
);

/**
 * POST /api/v1/rag/chat
 *
 * AI chatbot that answers questions grounded strictly on indexed documents.
 *
 * Request  : application/json
 *   { query: string, limit?: number (1-20, default 5) }
 *
 * Response : 200
 *   {
 *     answer : string            — AI-generated answer based on context
 *     sources: RetrievalResult[] — chunks used as context (content, metadata, score)
 *   }
 */
router.post(
  "/chat",
  chatValidation,
  validateInputs,
  ragController.chat.bind(ragController),
);

export const ragRoutes = router;
