import { Request, Response } from "express";
import { logger } from "../config/logger";

export const createPost = async (req: Request, res: Response) => {
  logger.info("BODY:", req.body);
  logger.info("FILE:", req.files);
  res.json({ body: req.body, files: req.files });
};
