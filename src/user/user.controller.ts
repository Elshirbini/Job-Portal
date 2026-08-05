import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { success } from "../utils/response";
import { UserRepository } from "./user.repository";
import { injectable } from "tsyringe";

@injectable()
export class UserController {
  constructor(private userRepository: UserRepository) {}

  public updateUser = async (req: Request, res: Response) => {
    const { fullName, phone, location } = req.body;
    const { id } = req.params;

    const user = await this.userRepository.findUserByAndUpdate(
      { user_id: id },
      { full_name: fullName, phone, location }
    );

    if (!user) throw new ApiError(req.__("User not found"), 404);

    return success(res, 200, user);
  };
}
