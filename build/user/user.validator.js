"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserValidation = void 0;
const express_validator_1 = require("express-validator");
exports.updateUserValidation = [
    (0, express_validator_1.body)("fullName").trim().isString().withMessage("Full name must be String"),
    (0, express_validator_1.body)("phone")
        .isNumeric()
        .withMessage("Phone must be number")
        .isLength({ min: 11, max: 11 })
        .withMessage("Phone must be 11 digits"),
];
