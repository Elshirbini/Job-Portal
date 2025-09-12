"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addJobValidation = void 0;
const express_validator_1 = require("express-validator");
exports.addJobValidation = [
    (0, express_validator_1.body)("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isString()
        .withMessage("Title must be string"),
    (0, express_validator_1.body)("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required")
        .isString()
        .withMessage("Description must be string"),
    (0, express_validator_1.body)("requirements")
        .isArray({ min: 1 })
        .withMessage("Requirements must be a non-empty array")
        .custom((arr) => arr.every((item) => typeof item === "string"))
        .withMessage("Each requirement must be a string"),
    (0, express_validator_1.body)("keyResponsibilities")
        .isArray({ min: 1 })
        .withMessage("keyResponsibilities must be a non-empty array")
        .custom((arr) => arr.every((item) => typeof item === "string"))
        .withMessage("Each keyResponsibility must be a string"),
    (0, express_validator_1.body)("qualifications")
        .isArray({ min: 1 })
        .withMessage("qualifications must be a non-empty array")
        .custom((arr) => arr.every((item) => typeof item === "string"))
        .withMessage("Each qualification must be a string"),
    (0, express_validator_1.body)("benefits")
        .isArray({ min: 1 })
        .withMessage("benefits must be a non-empty array")
        .custom((arr) => arr.every((item) => typeof item === "string"))
        .withMessage("Each benefit must be a string"),
    (0, express_validator_1.body)("attendanceType")
        .trim()
        .notEmpty()
        .withMessage("attendanceType is required")
        .isString()
        .withMessage("attendanceType must be string")
        .isIn(["remote", "hybrid", "on-site"])
        .withMessage("attendanceType must be remote, hybrid or on-site"),
    (0, express_validator_1.body)("employmentType")
        .trim()
        .notEmpty()
        .withMessage("employmentType is required")
        .isString()
        .withMessage("employmentType must be string")
        .isIn(["full-time", "part-time", "freelance", "internship"])
        .withMessage("employmentType must be full-time, part-time, freelance or internship"),
];
