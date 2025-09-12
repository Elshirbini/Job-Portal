import { NextFunction, Request, Response } from "express";
import { User } from "../user/user.model";
import { ApiError } from "../utils/apiError";

export const isCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) throw new ApiError(req.__("User not found"), 404);

  if (user.type !== "company") {
    throw new ApiError(
      req.__("You don't have the permissions to do this action"),
      403
    );
  }
  next();
};
