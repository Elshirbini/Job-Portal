"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCompany = void 0;
const user_model_1 = require("../user/user.model");
const apiError_1 = require("../utils/apiError");
const isCompany = async (req, res, next) => {
    const userId = req.userId;
    const user = await user_model_1.User.findById(userId);
    if (!user)
        throw new apiError_1.ApiError(req.__("User not found"), 404);
    if (user.type !== "company") {
        throw new apiError_1.ApiError(req.__("You don't have the permissions to do this action"), 403);
    }
    next();
};
exports.isCompany = isCompany;
