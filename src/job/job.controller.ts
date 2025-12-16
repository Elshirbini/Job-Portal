import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { success } from "../utils/response";
import {
  createJob,
  createSavedJob,
  deleteJobBy,
  deleteSavedJobBy,
  findJobBy,
  findJobByAndUpdate,
  getJobs,
} from "./job.repository";

export const addJob = async (req: Request, res: Response) => {
  const {
    title,
    description,
    requirements,
    qualifications,
    keyResponsibilities,
    benefits,
    attendanceType,
    employmentType,
  } = req.body;
  const { id } = req.params;
  const userId = req.userId;

  if (id !== userId) throw new ApiError(req.__("wrong credentials"), 404);

  await createJob({
    user_id: userId,
    title,
    description,
    requirements,
    qualifications,
    keyResponsibilities,
    benefits,
    attendanceType,
    employmentType,
  });

  return success(res, 201, { message: "Job posted successfully" });
};

export const updateJob = async (req: Request, res: Response) => {
  const {
    title,
    description,
    requirements,
    qualifications,
    keyResponsibilities,
    benefits,
    attendanceType,
    employmentType,
  } = req.body;
  const { id } = req.params;
  const userId = req.userId;

  const job = await findJobByAndUpdate(
    { job_id: id, user_id: userId },
    {
      title,
      description,
      requirements,
      qualifications,
      keyResponsibilities,
      benefits,
      attendanceType,
      employmentType,
    }
  );

  if (!job) throw new ApiError(req.__("Job not found"), 404);

  return success(res, 200, { message: "Job updated successfully" });
};

export const deleteJob = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  const job = await deleteJobBy({ job_id: id, user_id: userId });

  if (!job) throw new ApiError(req.__("Job not found"), 404);

  return success(res, 200, { message: "Job deleted successfully" });
};

export const getJob = async (req: Request, res: Response) => {
  const { id } = req.params;

  const job = await findJobBy({ job_id: id });

  if (!job) throw new ApiError(req.__("Job not found"), 404);

  return success(res, 200, { job });
};

export const getAllJobs = async (req: Request, res: Response) => {
  const jobs = await getJobs();

  return success(res, 200, { jobs });
};

export const saveJob = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userId!;

  const job = await findJobBy({ job_id: id });
  if (!job) throw new ApiError(req.__("Job not found"), 404);

  await createSavedJob({
    user_id: userId,
    job_id: id,
  });

  await findJobByAndUpdate({ job_id: id }, { numOfSaves: { increment: 1 } });

  return success(res, 200, { message: "Job saved successfully" });
};

export const unsaveJob = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  const job = await findJobBy({ job_id: id });
  if (!job) throw new ApiError(req.__("Job not found"), 404);

  const savedJob = await deleteSavedJobBy({ user_id: userId, job_id: id });
  if (!savedJob) {
    throw new ApiError(req.__("Saved job record not found"), 404);
  }

  if (job.numOfSaves > 0) {
    await findJobByAndUpdate({ job_id: id }, { numOfSaves: { decrement: 1 } });
  }

  return success(res, 200, { message: "Job saved successfully" });
};
