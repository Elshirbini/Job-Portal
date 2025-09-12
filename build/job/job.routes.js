"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRoutes = void 0;
const express_1 = __importDefault(require("express"));
const verifyToken_1 = require("../middlewares/verifyToken");
const job_validator_1 = require("./job.validator");
const validateInputs_1 = require("../middlewares/validateInputs");
const isCompany_1 = require("../middlewares/isCompany");
const job_controller_1 = require("./job.controller");
const router = express_1.default.Router();
router.use(verifyToken_1.verifyToken);
router.get("/", job_controller_1.getAllJobs);
router
    .route("/:id")
    .get(job_controller_1.getJob)
    .post(isCompany_1.isCompany, job_validator_1.addJobValidation, validateInputs_1.validateInputs, job_controller_1.addJob)
    .put(isCompany_1.isCompany, job_validator_1.addJobValidation, validateInputs_1.validateInputs, job_controller_1.updateJob)
    .delete(isCompany_1.isCompany, job_controller_1.deleteJob);
router.patch("/save-job/:id", job_controller_1.saveJob);
router.patch("/unsave-job/:id", job_controller_1.unsaveJob);
exports.jobRoutes = router;
