import { body } from "express-validator";

export const registrationValidation = [
  body("type")
    .trim()
    .notEmpty()
    .withMessage("Type is required")
    .isString()
    .withMessage("Type must be string")
    .isIn(["individual", "company"])
    .withMessage("type must be individual or company"),
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isString()
    .withMessage("Full name must be string"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email"),
  body("location").trim().isString().withMessage("Location must be string"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be string")
    .isLength({ min: 8, max: 16 })
    .withMessage("Password is weak , password must be from 8 to 16 chars"),
];

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email"),

  body("password").trim().notEmpty().withMessage("Password is required"),
];

export const otpValidator = [
  body("otp").notEmpty().withMessage("OTP is required").isString().withMessage("OTP must be String"),
];

export const emailValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email"),
];

export const passwordValidator = [
  body("newPassword")
    .trim()
    .notEmpty()
    .isLength({ min: 8, max: 16 })
    .withMessage("Password is weak , password must from 8 to 16 chars"),
];
