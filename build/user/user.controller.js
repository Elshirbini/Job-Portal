"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = void 0;
const user_model_1 = require("./user.model");
const apiError_1 = require("../utils/apiError");
const response_1 = require("../utils/response");
const updateUser = async (req, res) => {
    const { fullName, phone, location } = req.body;
    const { id } = req.params;
    const user = await user_model_1.User.findByIdAndUpdate(id, { fullName, phone, location }, { new: true, runValidators: true });
    if (!user)
        throw new apiError_1.ApiError(req.__("User not found"), 404);
    return (0, response_1.success)(res, 200, user);
};
exports.updateUser = updateUser;
