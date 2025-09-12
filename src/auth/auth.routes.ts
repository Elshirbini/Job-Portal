import express from "express";
import {
  forgetPassword,
  getProfile,
  login,
  logout,
  refreshAccessToken,
  resetPassword,
  signup,
  verifyEmail,
  verifyOtpForPassword,
} from "../auth/auth.controller";
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

const router = express.Router();

router.get("/get-profile", verifyToken, getProfile);

router.post("/login", loginValidator, validateInputs, login);
router.post(
  "/signup",
  signupLimiter,
  registrationValidation,
  validateInputs,
  signup
);
router.post(
  "/verify-email",
  verifyEmailLimiter,
  otpValidator,
  validateInputs,
  verifyEmail
);

router.patch(
  "/forget-password",
  emailValidator,
  validateInputs,
  forgetPassword
);
router.post("/verify-otp", otpValidator, validateInputs, verifyOtpForPassword);
router.patch(
  "/reset-password/:userId",
  passwordValidator,
  validateInputs,
  resetPassword
);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logout);

export const authRoutes = router;
