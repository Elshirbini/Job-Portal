import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { Job } from "./job.model";
import { success } from "../utils/response";
import { User } from "../user/user.model";

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

  await Job.create({
    userId,
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

  const job = await Job.findOneAndUpdate(
    { _id: id, userId: userId },
    {
      id,
      title,
      description,
      requirements,
      qualifications,
      keyResponsibilities,
      benefits,
      attendanceType,
      employmentType,
    },
    { new: true, runValidators: true }
  );

  if (!job) throw new ApiError(req.__("Job not found"), 404);

  return success(res, 200, { message: "Job updated successfully" });
};

export const deleteJob = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  const job = await Job.findOneAndDelete({ _id: id, userId: userId });

  if (!job) throw new ApiError(req.__("Job not found"), 404);

  return success(res, 200, { message: "Job deleted successfully" });
};

export const getJob = async (req: Request, res: Response) => {
  const { id } = req.params;

  const job = await Job.findById(id).populate("userId", "fullName location");

  if (!job) throw new ApiError(req.__("Job not found"), 404);

  return success(res, 200, { job });
};

export const getAllJobs = async (req: Request, res: Response) => {
  const jobs = await Job.find();

  return success(res, 200, { jobs });
};

export const saveJob = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  const job = await Job.findById(id).select("_id");
  if (!job) throw new ApiError(req.__("Job not found"), 404);

  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { savedJob: job._id } },
    { new: true, runValidators: true }
  );
  if (!user) throw new ApiError(req.__("User not found"), 404);

  job.numOfSaves += 1;
  await job.save();

  return success(res, 200, { message: "Job saved successfully" });
};

export const unsaveJob = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  const job = await Job.findById(id).select("_id");
  if (!job) throw new ApiError(req.__("Job not found"), 404);

  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { savedJob: job._id } },
    { new: true, runValidators: true }
  );
  if (!user) throw new ApiError(req.__("User not found"), 404);

  if (job.numOfSaves > 0) {
    job.numOfSaves -= 1;
    await job.save();
  }

  return success(res, 200, { message: "Job saved successfully" });
};
