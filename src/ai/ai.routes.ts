import express from "express";
import { container } from "tsyringe";
import { AIController } from "./ai.controller";
import {
  analyzeCandidateValidation,
  compareTextsValidation,
  generateTextValidation,
} from "./ai.validation";
import { validateInputs } from "../middlewares/validateInputs";

const router = express.Router();
const aiController = container.resolve(AIController);

router.post(
  "/generate",
  generateTextValidation,
  validateInputs,
  aiController.generate.bind(aiController),
);

router.post(
  "/analyze-candidate",
  analyzeCandidateValidation,
  validateInputs,
  aiController.analyzeCandidate.bind(aiController),
);

router.post(
  "/order-status",
  generateTextValidation,
  validateInputs,
  aiController.answerOrderQuestion.bind(aiController),
);

router.post(
  "/compare-texts",
  compareTextsValidation,
  validateInputs,
  container
    .resolve(AIController)
    .compareTexts.bind(container.resolve(AIController)),
);

export const aiRoutes = router;
