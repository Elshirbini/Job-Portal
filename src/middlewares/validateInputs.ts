import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiError";
import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";

export const validateInputs = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  logger.info(req.body);

  if (!errors.isEmpty()) {
    throw new ApiError(req.__(errors.array()[0].msg), 400);
  }

  next();
};
