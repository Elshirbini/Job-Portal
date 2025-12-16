import { fileTypeFromBuffer as fromBuffer } from "file-type";
import { ApiError } from "../utils/apiError";
import { NextFunction, Request, Response } from "express";

const allowedMime = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "application/pdf",
];

const allowedExt = ["jpg", "jpeg", "png", "webp", "mp4", "mov", "pdf"];

export const validateFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // نجمع الملفات من كل الحالات
    let files: Express.Multer.File[] = [];

    if (req.file) {
      files = [req.file]; // single
    } else if (Array.isArray(req.files)) {
      files = req.files; // array
    } else if (req.files && typeof req.files === "object") {
      files = Object.values(req.files).flat(); // fields
    }

    if (!files.length) {
      throw new ApiError("No files uploaded!", 400);
    }

    for (const file of files) {
      // 1. check mime
      if (!allowedMime.includes(file.mimetype)) {
        throw new ApiError("Invalid mimetype!", 403);
      }

      // 2. check buffer signature
      const fileType = await fromBuffer(file.buffer);
      if (!fileType) {
        throw new ApiError("Cannot detect file type!", 403);
      }

      if (!allowedExt.includes(fileType.ext)) {
        throw new ApiError("Invalid file signature!", 403);
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};
