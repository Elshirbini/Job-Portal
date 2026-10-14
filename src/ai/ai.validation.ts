import { body } from "express-validator";

export const generateTextValidation = [
  body("prompt")
    .exists()
    .withMessage("Prompt is required")
    .bail()
    .isString()
    .withMessage("Prompt must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Prompt must not be empty")
    .bail()
    .isLength({ max: 4000 })
    .withMessage("Prompt must not exceed 4000 characters"),
];

export const analyzeCandidateValidation = [
  body("candidate")
    .exists()
    .withMessage("Candidate information is required")
    .bail()
    .isString()
    .withMessage("Candidate information must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Candidate information must not be empty")
    .bail()
    .isLength({ max: 1000 })
    .withMessage("Candidate information must not exceed 1000 characters"),
  body("jobDescription")
    .exists()
    .withMessage("Job description is required")
    .bail()
    .isString()
    .withMessage("Job description must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Job description must not be empty")
    .bail()
    .isLength({ max: 4000 })
    .withMessage("Job description must not exceed 4000 characters"),
];

export const compareTextsValidation = [
  body("text1")
    .isString()
    .withMessage("text1 must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("text1 is required")
    .bail()
    .isLength({ max: 10000 })
    .withMessage("text1 must not exceed 10000 characters"),

  body("text2")
    .isString()
    .withMessage("text2 must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("text2 is required")
    .bail()
    .isLength({ max: 10000 })
    .withMessage("text2 must not exceed 10000 characters"),
];
