"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordValidator = exports.emailValidator = exports.otpValidator = exports.loginValidator = exports.registrationValidation = void 0;
const express_validator_1 = require("express-validator");
exports.registrationValidation = [
    (0, express_validator_1.body)("type")
        .trim()
        .notEmpty()
        .withMessage("Type is required")
        .isString()
        .withMessage("Type must be string")
        .isIn(["individual", "company"])
        .withMessage("type must be individual or company"),
    (0, express_validator_1.body)("fullName")
        .trim()
        .notEmpty()
        .withMessage("Full name is required")
        .isString()
        .withMessage("Full name must be string"),
    (0, express_validator_1.body)("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email"),
    (0, express_validator_1.body)("location").trim().isString().withMessage("Location must be string"),
    (0, express_validator_1.body)("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isString()
        .withMessage("Password must be string")
        .isLength({ min: 8, max: 16 })
        .withMessage("Password is weak , password must be from 8 to 16 chars"),
];
exports.loginValidator = [
    (0, express_validator_1.body)("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email"),
    (0, express_validator_1.body)("password").trim().notEmpty().withMessage("Password is required"),
];
exports.otpValidator = [
    (0, express_validator_1.body)("otp").notEmpty().withMessage("OTP is required").isString().withMessage("OTP must be String"),
];
exports.emailValidator = [
    (0, express_validator_1.body)("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email"),
];
exports.passwordValidator = [
    (0, express_validator_1.body)("newPassword")
        .trim()
        .notEmpty()
        .isLength({ min: 8, max: 16 })
        .withMessage("Password is weak , password must from 8 to 16 chars"),
];
