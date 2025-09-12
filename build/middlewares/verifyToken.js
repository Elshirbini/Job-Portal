"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = require("dotenv");
const apiError_1 = require("../utils/apiError");
const user_model_1 = require("../user/user.model");
(0, dotenv_1.configDotenv)();
const verifyToken = async (req, res, next) => {
    let token;
    if (req.cookies["accessToken"]) {
        token = req.cookies["accessToken"];
    }
    if (!token)
        return next(new apiError_1.ApiError("Unauthorized", 400));
    const user = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!user)
        return next(new apiError_1.ApiError(req.__("Token is not valid"), 401));
    req.userId = user.id;
    req.userRole = user.role;
    const userDoc = await user_model_1.User.findById(user.id);
    if (!userDoc)
        return next(new apiError_1.ApiError(req.__("User not found"), 404));
    next();
};
exports.verifyToken = verifyToken;
