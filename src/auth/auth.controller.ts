import { ApiError } from "../utils/apiError";
import redisClient from "../config/redis";
import { generateOTP } from "../utils/generateOTP";
import { hash, compare } from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendToEmails } from "../utils/sendMails";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokens.util";
import { NextFunction, Request, Response } from "express";
import { success } from "../utils/response";
import { UserRepository } from "../user/user.repository";
import { CloudflareService } from "../services/cloudflareR2";
import { injectable } from "tsyringe";
import { logger } from "../config/logger";
import { Prisma } from "@prisma/client";
import { IUser } from "../user/interfaces/user.interface";
import { prisma } from "../prisma";

const refreshCookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: process.env.NODE_ENV === "prod",
  sameSite: process.env.NODE_ENV === "prod" ? "none" : "strict",
} as object;
const accessCookieOptions = {
  maxAge: 15 * 60 * 1000,
  httpOnly: true,
  secure: process.env.NODE_ENV === "prod",
  sameSite: process.env.NODE_ENV === "prod" ? "none" : "strict",
} as object;

@injectable()
export class AuthController {
  constructor(
    private userRepository: UserRepository,
    private cloudflareR2: CloudflareService
  ) {}

  public getProfile = async (req: Request, res: Response) => {
    const user_id = req.user_id;

    const user = await this.userRepository.findUserBy({ user_id: user_id });
    if (!user) throw new ApiError(req.__("User not found"), 404);

    res.status(200).json({ user });
  };

  public login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await this.userRepository.findUserBy({ email: email, is_verified: true });

    if (!user) throw new ApiError(req.__("User not found"), 404);

    if (!user.password && user.google_id) {
      res.redirect("http://localhost:8080/auth/google");
    }

    const isPassEq = await compare(password, user.password!);
    if (!isPassEq) throw new ApiError(req.__("Password Wrong"), 401);

    const accessToken = await generateAccessToken(
      user.user_id.toString(),
      user.role,
    );
    const refreshToken = await generateRefreshToken(user.user_id.toString());

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
    res.cookie("accessToken", accessToken, accessCookieOptions);

    return success(res, 200, {
      message: "Login successfully",
      data: {
        name: user.full_name,
        role: user.role === "admin" ? "admin" : "user",
      },
    });
  };

  public signup = async (req: Request, res: Response) => {
    const { type, fullName, email, location, password, rePassword } = req.body;
    const file = req.file;
    let image: { url?: string; key?: string } = {};
    let user: Partial<IUser> = {};

    if (password !== rePassword) {
      throw new ApiError(req.__("Password and rePassword must be equal"), 401);
    }

    const isExist = await this.userRepository.findUserBy({ email: email });

    if (isExist && isExist.is_verified) {
      throw new ApiError(req.__("This account is already exist"), 403);
    }

    const otp = generateOTP();

    if (type === "company" && !location) {
      throw new ApiError("Location is required", 403);
    }

    if (file) {
      const { url, key } = await this.cloudflareR2.uploadFileS3(
        file.buffer,
        `profile-images/${Date.now()}`,
        file.mimetype,
      );
      image.url = url;
      image.key = key;
    }

    const hashedPassword = await hash(password, 10);

    const userData = {
      type,
      full_name: fullName,
      email,
      password: hashedPassword,
      location,
      imageKey: image.key,
      imageUrl: image.url,
      is_verified: false,
    };

    if (isExist && !isExist.is_verified) {
      user = await this.userRepository.findUserByAndUpdate({ email: email }, userData);
    } else {
      user = await this.userRepository.createUser(userData);
    }

    redisClient.setEx(`${otp}`, 300, JSON.stringify({ user_id: user.user_id }));

    await sendToEmails(
      email,
      "Account Verification - Your OTP Code",
      `
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
    `,
    );

    return success(res, 200, "OTP sent");
  };

  public verifyEmail = async (req: Request, res: Response) => {
    const { otp } = req.body;

    const userData = await redisClient.get(`${otp}`);
    if (!userData) {
      throw new ApiError(req.__("Invalid or expired verification code"), 403);
    }

    const parsedData = JSON.parse(userData);

    const { user_id } = parsedData;

    const user = await this.userRepository.findUserByAndUpdate(
      { user_id: user_id },
      { is_verified: true },
    );

    if (!user) {
      throw new ApiError(req.__("User not found"), 404);
    }

    await redisClient.del(`${otp}`);

    await sendToEmails(
      user.email,
      "✅ Account Created Successfully",
      `
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
    `,
    );

    return success(res, 201, "Account verified successfully");
  };

  public forgetPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    const otp = generateOTP();
    const cryptOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await this.userRepository.findUserByAndUpdate(
      { email: email },
      {
        codeValidation: cryptOtp,
        codeValidationExpire: new Date(Date.now() + 5 * 60 * 1000),
      },
    );

    if (!user) throw new ApiError(req.__("This email has no account"), 404);

    await sendToEmails(email, "OTP", otp);

    return success(res, 200, "Code sent successfully");
  };

  public verifyOtpForPassword = async (req: Request, res: Response) => {
    const { otp } = req.body;

    const cryptOtp = crypto.createHash("sha256").update(`${otp}`).digest("hex");

    const user = await this.userRepository.findUserBy({
      codeValidation: cryptOtp,
      codeValidationExpire: { gt: new Date() },
    });

    if (!user) {
      throw new ApiError(req.__("Invalid or expired verification code"), 401);
    }

    return success(res, 200, { data: { user_id: user.user_id } });
  };

  public resetPassword = async (req: Request, res: Response) => {
    const { newPassword, confirmNewPassword } = req.body;
    const { user_id } = req.params;

    if (newPassword !== confirmNewPassword) {
      throw new ApiError(req.__("Password and rePassword must be equal"), 403);
    }

    const userDoc = await this.userRepository.findUserBy({ user_id: user_id });
    if (!userDoc || !userDoc.password)
      throw new ApiError(req.__("User not found"), 404);

    const isSet = await compare(newPassword, userDoc.password);
    if (isSet) {
      throw new ApiError(req.__("This password has already exists"), 403);
    }

    const hashedPassword = await hash(newPassword, 12);

    const user = await this.userRepository.findUserByAndUpdate(
      { user_id: user_id },
      {
        password: hashedPassword,
        codeValidation: undefined,
        codeValidationExpire: undefined,
      },
    );

    if (!user) {
      throw new ApiError(req.__("Invalid or expired verification code"), 401);
    }

    return success(res, 200, "Your password change successfully");
  };

  public refreshAccessToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const refreshToken = req.cookies["refreshToken"];
    if (!refreshToken)
      return next(new ApiError(req.__("Invalid refresh token"), 401));

    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
    ) as {
      id: string;
    };

    if (!payload) return next(new ApiError(req.__("Token is not valid"), 401));

    const user = await this.userRepository.findUserBy({ user_id: payload.id });
    if (!user) return next(new ApiError(req.__("User not found"), 404));

    const newAccessToken = await generateAccessToken(
      user.user_id.toString(),
      user.role,
    );

    res.cookie("accessToken", newAccessToken, accessCookieOptions);

    return success(res, 200, { message: "Access token updated" });
  };

  public logout = async (req: Request, res: Response) => {
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    return success(res, 200, "Logged out successfully");
  };
}
