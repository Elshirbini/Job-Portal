import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { addJobValidation } from "./job.validator";
import { validateInputs } from "../middlewares/validateInputs";
import { isCompany } from "../middlewares/isCompany";
import {
  addJob,
  deleteJob,
  getAllJobs,
  getJob,
  saveJob,
  unsaveJob,
  updateJob,
} from "./job.controller";

const router = express.Router();

router.use(verifyToken);

router.get("/", getAllJobs);
router
  .route("/:id")
  .get(getJob)
  .post(isCompany, addJobValidation, validateInputs, addJob)
  .put(isCompany, addJobValidation, validateInputs, updateJob)
  .delete(isCompany, deleteJob);

router.patch("/save-job/:id", saveJob);
router.patch("/unsave-job/:id", unsaveJob);

export const jobRoutes = router;
