import { Response } from "express";

export const success = (
  res: Response,
  statusCode: number,
  data: object | string | null = null
) => {
  if (typeof data === "string") {
    return res.status(statusCode).json({ success: true, message: data });
  }

  return res.status(statusCode).json({ success: true, ...data });
};
