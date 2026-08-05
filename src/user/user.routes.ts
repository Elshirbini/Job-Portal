import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { UserController } from "./user.controller";
import { updateUserValidation } from "./user.validator";
import { validateInputs } from "../middlewares/validateInputs";
import { container } from "tsyringe";

const router = express.Router();
const userController = container.resolve(UserController);

router.patch(
  "/:id",
  verifyToken,
  updateUserValidation,
  validateInputs,
  userController.updateUser
);

export const userRoutes = router;
