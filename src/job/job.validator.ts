import { body } from "express-validator";

export const addJobValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be string"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isString()
    .withMessage("Description must be string"),
  body("requirements")
    .isArray({ min: 1 })
    .withMessage("Requirements must be a non-empty array")
    .custom((arr) => arr.every((item: string) => typeof item === "string"))
    .withMessage("Each requirement must be a string"),
  body("keyResponsibilities")
    .isArray({ min: 1 })
    .withMessage("keyResponsibilities must be a non-empty array")
    .custom((arr) => arr.every((item: string) => typeof item === "string"))
    .withMessage("Each keyResponsibility must be a string"),
  body("qualifications")
    .isArray({ min: 1 })
    .withMessage("qualifications must be a non-empty array")
    .custom((arr) => arr.every((item: string) => typeof item === "string"))
    .withMessage("Each qualification must be a string"),
  body("benefits")
    .isArray({ min: 1 })
    .withMessage("benefits must be a non-empty array")
    .custom((arr) => arr.every((item: string) => typeof item === "string"))
    .withMessage("Each benefit must be a string"),
  body("attendanceType")
    .trim()
    .notEmpty()
    .withMessage("attendanceType is required")
    .isString()
    .withMessage("attendanceType must be string")
    .isIn(["remote", "hybrid", "on-site"])
    .withMessage("attendanceType must be remote, hybrid or on-site"),
  body("employmentType")
    .trim()
    .notEmpty()
    .withMessage("employmentType is required")
    .isString()
    .withMessage("employmentType must be string")
    .isIn(["full-time", "part-time", "freelance", "internship"])
    .withMessage(
      "employmentType must be full-time, part-time, freelance or internship"
    ),
];
