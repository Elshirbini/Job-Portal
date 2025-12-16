"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = void 0;
const apiError_1 = require("../utils/apiError");
const response_1 = require("../utils/response");
const user_repository_1 = require("./user.repository");
const updateUser = async (req, res) => {
    const { fullName, phone, location } = req.body;
    const { id } = req.params;
    const user = await (0, user_repository_1.findUserByAndUpdate)({ user_id: id }, { full_name: fullName, phone, location });
    if (!user)
        throw new apiError_1.ApiError(req.__("User not found"), 404);
    return (0, response_1.success)(res, 200, user);
};
exports.updateUser = updateUser;
