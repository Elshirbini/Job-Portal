import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { UserRepository } from "../user/user.repository";
import { container } from "tsyringe";

export const isCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user_id = req.user_id;
  const user = await container.resolve(UserRepository).findUserBy({ user_id: user_id });
  if (!user) throw new ApiError(req.__("User not found"), 404);

  if (user.type !== "company") {
    throw new ApiError(
      req.__("You don't have the permissions to do this action"),
      403
    );
  }
  next();
};
