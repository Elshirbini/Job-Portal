"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInputs = void 0;
const express_validator_1 = require("express-validator");
const apiError_1 = require("../utils/apiError");
const logger_1 = require("../config/logger");
const validateInputs = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    logger_1.logger.info(req.body);
    if (!errors.isEmpty()) {
        throw new apiError_1.ApiError(req.__(errors.array()[0].msg), 400);
    }
    next();
};
exports.validateInputs = validateInputs;
