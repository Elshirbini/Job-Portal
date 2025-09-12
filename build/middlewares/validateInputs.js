"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInputs = void 0;
const express_validator_1 = require("express-validator");
const apiError_1 = require("../utils/apiError");
const validateInputs = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new apiError_1.ApiError(req.__(errors.array()[0].msg), 400);
    }
    next();
};
exports.validateInputs = validateInputs;
