"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshAccessToken = exports.resetPassword = exports.verifyOtpForPassword = exports.forgetPassword = exports.verifyEmail = exports.signup = exports.login = exports.getProfile = void 0;
const apiError_1 = require("../utils/apiError");
const redis_1 = __importDefault(require("../config/redis"));
const user_model_1 = require("../user/user.model");
const generateOTP_1 = require("../utils/generateOTP");
const bcrypt_1 = require("bcrypt");
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendMails_1 = require("../utils/sendMails");
const tokens_util_1 = require("../utils/tokens.util");
const response_1 = require("../utils/response");
const refreshCookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "prod",
    sameSite: process.env.NODE_ENV === "prod" ? "none" : "strict",
};
const accessCookieOptions = {
    maxAge: 15 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "prod",
    sameSite: process.env.NODE_ENV === "prod" ? "none" : "strict",
};
const getProfile = async (req, res) => {
    const userId = req.userId;
    const user = await user_model_1.User.findById(userId);
    if (!user)
        throw new apiError_1.ApiError(req.__("User not found"), 404);
    res.status(200).json({ user });
};
exports.getProfile = getProfile;
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await user_model_1.User.findOne({ email: email });
    if (!user)
        throw new apiError_1.ApiError(req.__("User not found"), 404);
    if (!user.password && user.googleId) {
        res.redirect("http://localhost:8080/auth/google");
    }
    const isPassEq = await (0, bcrypt_1.compare)(password, user.password);
    if (!isPassEq)
        throw new apiError_1.ApiError(req.__("Password Wrong"), 401);
    const accessToken = await (0, tokens_util_1.generateAccessToken)(user._id.toString(), user.role);
    const refreshToken = await (0, tokens_util_1.generateRefreshToken)(user._id.toString());
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
    res.cookie("accessToken", accessToken, accessCookieOptions);
    return (0, response_1.success)(res, 200, {
        message: "Login successfully",
        name: user.fullName,
        role: user.role === "admin" ? "admin" : "user",
    });
};
exports.login = login;
const signup = async (req, res) => {
    const { type, fullName, email, location, password, rePassword } = req.body;
    if (password !== rePassword) {
        throw new apiError_1.ApiError(req.__("Password and rePassword must be equal"), 401);
    }
    const isExist = await user_model_1.User.findOne({ email: email });
    if (isExist)
        throw new apiError_1.ApiError(req.__("This email is already exist"), 403);
    const otp = (0, generateOTP_1.generateOTP)();
    if (type === "company" && !location) {
        throw new apiError_1.ApiError("Location is required", 403);
    }
    const userData = { type, fullName, email, password, location };
    redis_1.default.setEx(`${otp}`, 300, JSON.stringify(userData));
    await (0, sendMails_1.sendToEmails)(email, "Account Verification - Your OTP Code", `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">🔐 Verify Your Account</h2>
        <p style="font-size: 16px; color: #555;">
          Thank you for signing up! To complete your registration, please use the OTP code below:
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #007bff;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #999;">
          This code will expire in 10 minutes. If you didn’t request this, please ignore this email.
        </p>
        <p style="font-size: 14px; color: #555;">
          Best regards,<br />
          The Support Team
        </p>
      </div>
    </div>
  `);
    return (0, response_1.success)(res, 200, { message: "OTP sent" });
};
exports.signup = signup;
const verifyEmail = async (req, res) => {
    const { otp } = req.body;
    const userData = await redis_1.default.get(`${otp}`);
    if (!userData) {
        throw new apiError_1.ApiError(req.__("Invalid or expired verification code"), 403);
    }
    const parsedData = JSON.parse(userData);
    const { type, email, fullName, password, location } = parsedData;
    const hashedPassword = await (0, bcrypt_1.hash)(password, 12);
    const createData = {
        type,
        fullName,
        email,
        location,
        password: hashedPassword,
    };
    await user_model_1.User.create(createData);
    await redis_1.default.del(`${otp}`);
    await (0, sendMails_1.sendToEmails)(email, "✅ Account Created Successfully", `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color: #28a745;">🎉 Account Created Successfully!</h2>
    <p style="font-size: 16px; color: #333;">Hi there,</p>
    <p style="font-size: 16px; color: #333;">
      Your account has been created successfully. You can now log in and start using our services.
    </p>
    <p style="font-size: 14px; color: #666;">If you have any questions or need help, feel free to reach out to our support team.</p>
    <hr style="margin: 30px 0;">
    <p style="font-size: 12px; color: #aaa;">Thank you for joining us!</p>
  </div>
  `);
    return (0, response_1.success)(res, 201, { message: "Account created successfully" });
};
exports.verifyEmail = verifyEmail;
const forgetPassword = async (req, res) => {
    const { email } = req.body;
    const otp = (0, generateOTP_1.generateOTP)();
    const cryptOtp = crypto_1.default.createHash("sha256").update(otp).digest("hex");
    const user = await user_model_1.User.findOneAndUpdate({ email: email }, {
        codeValidation: cryptOtp,
        codeValidationExpire: new Date(Date.now() + 5 * 60 * 1000),
    }, {
        new: true,
        runValidators: true,
    });
    if (!user)
        throw new apiError_1.ApiError(req.__("This email has no account"), 404);
    await (0, sendMails_1.sendToEmails)(email, "OTP", otp);
    return (0, response_1.success)(res, 200, { message: "Code sent successfully" });
};
exports.forgetPassword = forgetPassword;
const verifyOtpForPassword = async (req, res) => {
    const { otp } = req.body;
    const cryptOtp = crypto_1.default.createHash("sha256").update(`${otp}`).digest("hex");
    const user = await user_model_1.User.findOne({
        codeValidation: cryptOtp,
        codeValidationExpire: { $gt: Date.now() },
    });
    if (!user) {
        throw new apiError_1.ApiError(req.__("Invalid or expired verification code"), 401);
    }
    return (0, response_1.success)(res, 200, { userId: user._id });
};
exports.verifyOtpForPassword = verifyOtpForPassword;
const resetPassword = async (req, res) => {
    const { newPassword, confirmNewPassword } = req.body;
    const { userId } = req.params;
    if (newPassword !== confirmNewPassword) {
        throw new apiError_1.ApiError(req.__("Password and rePassword must be equal"), 403);
    }
    const userDoc = await user_model_1.User.findById(userId);
    if (!userDoc || !userDoc.password)
        throw new apiError_1.ApiError(req.__("User not found"), 404);
    const isSet = await (0, bcrypt_1.compare)(newPassword, userDoc.password);
    if (isSet) {
        throw new apiError_1.ApiError(req.__("This password has already exists"), 403);
    }
    const hashedPassword = await (0, bcrypt_1.hash)(newPassword, 12);
    const user = await user_model_1.User.findByIdAndUpdate(userId, {
        password: hashedPassword,
        codeValidation: undefined,
        codeValidationExpire: undefined,
    }, {
        new: true,
        runValidators: true,
    });
    if (!user) {
        throw new apiError_1.ApiError(req.__("Invalid or expired verification code"), 401);
    }
    return (0, response_1.success)(res, 200, {
        message: "Your password change successfully",
    });
};
exports.resetPassword = resetPassword;
const refreshAccessToken = async (req, res, next) => {
    const refreshToken = req.cookies["refreshToken"];
    if (!refreshToken)
        return next(new apiError_1.ApiError(req.__("Invalid refresh token"), 401));
    const payload = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!payload)
        return next(new apiError_1.ApiError(req.__("Token is not valid"), 401));
    const user = await user_model_1.User.findById(payload.id);
    if (!user)
        return next(new apiError_1.ApiError(req.__("User not found"), 404));
    const newAccessToken = await (0, tokens_util_1.generateAccessToken)(user._id.toString(), user.role);
    res.cookie("accessToken", newAccessToken, accessCookieOptions);
    return (0, response_1.success)(res, 200, { message: "Access token updated" });
};
exports.refreshAccessToken = refreshAccessToken;
const logout = async (req, res) => {
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    return (0, response_1.success)(res, 200, { message: "Logged out successfully" });
};
exports.logout = logout;
