"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const apiError_1 = require("../utils/apiError");
const isAdmin = async (req, res, next) => {
    const userRole = req.userRole;
    if (userRole !== "admin") {
        throw new apiError_1.ApiError(req.__("You don't have the permissions to do this action"), 403);
    }
    next();
};
exports.isAdmin = isAdmin;
