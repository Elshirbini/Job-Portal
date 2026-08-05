import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { addJobValidation } from "./job.validator";
import { validateInputs } from "../middlewares/validateInputs";
import { isCompany } from "../middlewares/isCompany";
import { JobController } from "./job.controller";
import { container } from "tsyringe";

const router = express.Router();
const jobController = container.resolve(JobController);

router.use(verifyToken);

router.get("/", jobController.getAllJobs);
router
  .route("/:id")
  .get(jobController.getJob)
  .post(isCompany, addJobValidation, validateInputs, jobController.addJob)
  .put(isCompany, addJobValidation, validateInputs, jobController.updateJob)
  .delete(isCompany, jobController.deleteJob);

router.patch("/save-job/:id", jobController.saveJob);
router.patch("/unsave-job/:id", jobController.unsaveJob);

export const jobRoutes = router;
