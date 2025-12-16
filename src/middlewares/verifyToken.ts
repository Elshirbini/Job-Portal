import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import { ApiError } from "../utils/apiError";
import { NextFunction, Request, Response } from "express";
import { findUserBy } from "../user/user.repository";

configDotenv();

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;
  if (req.cookies["accessToken"]) {
    token = req.cookies["accessToken"];
  }

  if (!token) return next(new ApiError("Unauthorized", 400));

  const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
    id: string;
    role: string;
  };

  if (!user) return next(new ApiError(req.__("Token is not valid"), 401));

  req.userId = user.id;
  req.userRole = user.role;

  const userDoc = await findUserBy({ user_id: user.id });
  if (!userDoc) return next(new ApiError(req.__("User not found"), 404));
  next();
};
