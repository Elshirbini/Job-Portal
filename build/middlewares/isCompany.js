"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCompany = void 0;
const apiError_1 = require("../utils/apiError");
const user_repository_1 = require("../user/user.repository");
const isCompany = async (req, res, next) => {
    const userId = req.userId;
    const user = await (0, user_repository_1.findUserBy)({ user_id: userId });
    if (!user)
        throw new apiError_1.ApiError(req.__("User not found"), 404);
    if (user.type !== "company") {
        throw new apiError_1.ApiError(req.__("You don't have the permissions to do this action"), 403);
    }
    next();
};
exports.isCompany = isCompany;
