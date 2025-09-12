import { NextFunction, Request, Response } from "express";
import { httpLogger } from "../config/logger";

export const httpLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const { method, originalUrl } = req;
    const { statusCode } = res;
    const duration = Date.now() - start;

    const logMessage = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;
    httpLogger.http(logMessage);
  });

  next();
};
