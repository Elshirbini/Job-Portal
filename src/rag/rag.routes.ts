import express from "express";
import { container } from "tsyringe";
import { RagController } from "./rag.controller";
import { upload } from "../config/multerMemory";

const router = express.Router();

const ragController = container.resolve(RagController);

/**
 * POST /api/v1/rag/documents
 *
 * Ingests a plain-text (.txt) file into the RAG vector store.
 *
 * Request  : multipart/form-data  { file: <text/plain, max 1 MB> }
 * Response : 201 { documentId, filename, message }
 */
router.post(
  "/documents",
  upload.single("file"),
  ragController.ingestTextFile.bind(ragController),
);

export const ragRoutes = router;
