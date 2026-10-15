import { body } from "express-validator";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";

const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB
const ALLOWED_MIME_TYPE = "text/plain";

/**
 * Validates the uploaded text file:
 *  - Ensures a file is present
 *  - Enforces MIME type (text/plain)
 *  - Enforces a maximum size of 1 MB
 */
export const validateTextFile = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const file = req.file;

    if (!file) {
      throw new ApiError("No file uploaded. Please upload a .txt file.", 400);
    }

    if (file.mimetype !== ALLOWED_MIME_TYPE) {
      throw new ApiError(
        `Invalid file type "${file.mimetype}". Only plain text (.txt) files are accepted.`,
        415,
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new ApiError(
        `File is too large (${file.size} bytes). Maximum allowed size is 1 MB.`,
        413,
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * express-validator rules for POST /chat
 *
 * Body:
 *   query  : required, non-empty string, max 1000 chars
 *   limit  : optional integer 1-20, defaults to 5 in the service
 */
export const chatValidation = [
  body("query")
    .exists({ checkFalsy: true })
    .withMessage("Field 'query' is required")
    .bail()
    .isString()
    .withMessage("Field 'query' must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Field 'query' must not be empty")
    .bail()
    .isLength({ max: 1000 })
    .withMessage("Field 'query' must not exceed 1000 characters"),

  body("limit")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("Field 'limit' must be an integer between 1 and 20")
    .toInt(),
];
