import { injectable } from "tsyringe";
import { Request, Response } from "express";
import { DocumentIngestionService } from "./services/documentIngestion.service";
import { success } from "../utils/response";
import { ApiError } from "../utils/apiError";
import { validateUploadedFile } from "../utils/file-validation.util";

@injectable()
export class RagController {
  constructor(
    private readonly documentIngestionService: DocumentIngestionService,
  ) {}

  /**
   * POST /api/v1/rag/documents
   *
   * Accepts a single .txt file (multipart/form-data, field name: "file"),
   * ingests it through the RAG pipeline (chunk → embed → store in Qdrant),
   * and persists document metadata in the DB.
   *
   * Returns the created document id and filename on success.
   */
  async ingestTextFile(req: Request, res: Response): Promise<void> {
    const file = req.file!;

    if (file.mimetype !== "text/plain") {
      throw new ApiError("Only plain-text (.txt) files are allowed.", 422);
    }

    if (file.size > 1 * 1024 * 1024) {
      throw new ApiError("File size exceeds the 1 MB limit.", 422);
    }

    const filename = file.originalname.trim();
    const content = file.buffer.toString("utf-8");

    if (!content.trim()) {
      throw new ApiError("The uploaded file is empty.", 422);
    }

    const documentId = await this.documentIngestionService.ingestText(
      filename,
      content,
      file.mimetype,
    );

    success(res, 201, {
      documentId,
      filename,
      message: "File ingested successfully and is now indexed.",
    });
  }
}
