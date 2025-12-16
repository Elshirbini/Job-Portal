import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { success } from "../utils/response";
import { findUserByAndUpdate } from "./user.repository";

export const updateUser = async (req: Request, res: Response) => {
  const { fullName, phone, location } = req.body;
  const { id } = req.params;

  const user = await findUserByAndUpdate(
    { user_id: id },
    { full_name: fullName, phone, location }
  );

  if (!user) throw new ApiError(req.__("User not found"), 404);

  return success(res, 200, user);
};
