"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReferralCode = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateReferralCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const bytes = crypto_1.default.randomBytes(9);
    let code = "";
    for (let i = 0; i < 9; i++) {
        code += chars[bytes[i] % chars.length];
    }
    return `${code}`;
};
exports.generateReferralCode = generateReferralCode;
