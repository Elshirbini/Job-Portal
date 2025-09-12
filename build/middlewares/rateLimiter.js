"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalApiLimiter = exports.verifyEmailLimiter = exports.signupLimiter = exports.inviteCodeLimiter = exports.loginLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// /login
exports.loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts. Please try again after 15 minutes.",
    standardHeaders: true,
    legacyHeaders: false,
});
// /invite-code
exports.inviteCodeLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: "Too many attempts. Please try again after an hour.",
    standardHeaders: true,
    legacyHeaders: false,
});
// /signup
exports.signupLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Too many signup attempts. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});
// /verify-email
exports.verifyEmailLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Too many verification attempts. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});
exports.generalApiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // دقيقة واحدة
    max: 100, // بحد أقصى 100 request في الدقيقة لكل IP
    message: "Too many requests from this IP, please slow down.",
    standardHeaders: true,
    legacyHeaders: false,
});
