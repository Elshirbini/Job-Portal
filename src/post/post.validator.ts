import { body } from "express-validator";

export const createPostValidator = [
  body("text")
    .notEmpty()
    .withMessage("Text is required")
    .isString()
    .withMessage("Text must be a string"),
  body("privacy")
    .optional()
    .isString()
    .withMessage("Privacy must be a string")
    .isIn(["public", "friends", "private"])
    .withMessage("Invalid privacy value"),
];
