import { Response } from "express";

export const success = (res: Response, statusCode: number, data = {}) => {
  return res.status(statusCode).json({ success: true, data: data });
};
