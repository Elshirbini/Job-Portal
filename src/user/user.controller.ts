import { Request, Response } from "express";
import { User } from "./user.model";
import { ApiError } from "../utils/apiError";
import { success } from "../utils/response";

export const updateUser = async (req: Request, res: Response) => {
  const { fullName, phone, location } = req.body;
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    id,
    { fullName, phone, location },
    { new: true, runValidators: true }
  );

  if (!user) throw new ApiError(req.__("User not found"), 404);

  return success(res, 200, user);
};
