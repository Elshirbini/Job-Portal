import express from "express";
import { AuthController } from "../auth/auth.controller";
import {
  emailValidator,
  loginValidator,
  otpValidator,
  passwordValidator,
  registrationValidation,
} from "./auth.validator";
import { validateInputs } from "../middlewares/validateInputs";
import {
  loginLimiter,
  signupLimiter,
  verifyEmailLimiter,
} from "../middlewares/rateLimiter";
import { verifyToken } from "../middlewares/verifyToken";
import { upload } from "../config/multerMemory";
import { validateFiles } from "../middlewares/validateFiles";
import { container } from "tsyringe";

const router = express.Router();
const authController = container.resolve(AuthController);

router.get("/profile", verifyToken, authController.getProfile);

router.post("/login", loginValidator, validateInputs, authController.login);
router.post(
  "/signup",
  signupLimiter,
  upload.single("image"),
  validateFiles,
  registrationValidation,
  validateInputs,
  authController.signup
);
router.post(
  "/verify-email",
  verifyEmailLimiter,
  otpValidator,
  validateInputs,
  authController.verifyEmail
);

router.patch(
  "/forget-password",
  emailValidator,
  validateInputs,
  authController.forgetPassword
);
router.post("/verify-otp", otpValidator, validateInputs, authController.verifyOtpForPassword);
router.patch(
  "/reset-password/:user_id",
  passwordValidator,
  validateInputs,
  authController.resetPassword
);
router.post("/refresh-token", authController.refreshAccessToken);
router.post("/logout", authController.logout);

export const authRoutes = router;
