"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = exports.generateRefreshToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const apiError_1 = require("./apiError");
const generateRefreshToken = async (_id) => {
    const token = await new Promise((resolve, reject) => {
        jsonwebtoken_1.default.sign({ id: _id }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "7d",
        }, (err, token) => {
            if (err)
                return reject(new apiError_1.ApiError("Error in signing token", 501));
            resolve(token);
        });
    });
    return token;
};
exports.generateRefreshToken = generateRefreshToken;
const generateAccessToken = async (_id, role) => {
    const token = await new Promise((resolve, reject) => {
        jsonwebtoken_1.default.sign({ id: _id, role }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15m",
        }, (err, token) => {
            if (err)
                return reject(new apiError_1.ApiError("Error in signing token", 501));
            resolve(token);
        });
    });
    return token;
};
exports.generateAccessToken = generateAccessToken;
