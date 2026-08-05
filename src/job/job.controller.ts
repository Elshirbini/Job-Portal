import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { success } from "../utils/response";
import { JobRepository } from "./job.repository";
import { injectable } from "tsyringe";

@injectable()
export class JobController {
  constructor(private jobRepository: JobRepository) {}

  public addJob = async (req: Request, res: Response) => {
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
    const user_id = req.user_id;

    if (id !== user_id) throw new ApiError(req.__("wrong credentials"), 404);

    await this.jobRepository.createJob({
      user_id: user_id,
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

  public updateJob = async (req: Request, res: Response) => {
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
    const user_id = req.user_id;

    const job = await this.jobRepository.findJobByAndUpdate(
      { job_id: id, user_id: user_id },
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

  public deleteJob = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user_id = req.user_id;

    const job = await this.jobRepository.deleteJobBy({ job_id: id, user_id: user_id });

    if (!job) throw new ApiError(req.__("Job not found"), 404);

    return success(res, 200, { message: "Job deleted successfully" });
  };

  public getJob = async (req: Request, res: Response) => {
    const { id } = req.params;

    const job = await this.jobRepository.findJobBy({ job_id: id });

    if (!job) throw new ApiError(req.__("Job not found"), 404);

    return success(res, 200, { job });
  };

  public getAllJobs = async (req: Request, res: Response) => {
    const jobs = await this.jobRepository.getJobs();

    return success(res, 200, { jobs });
  };

  public saveJob = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user_id = req.user_id!;

    const job = await this.jobRepository.findJobBy({ job_id: id });
    if (!job) throw new ApiError(req.__("Job not found"), 404);

    await this.jobRepository.createSavedJob({
      user_id: user_id,
      job_id: id,
    });

    await this.jobRepository.findJobByAndUpdate({ job_id: id }, { numOfSaves: { increment: 1 } });

    return success(res, 200, { message: "Job saved successfully" });
  };

  public unsaveJob = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user_id = req.user_id;

    const job = await this.jobRepository.findJobBy({ job_id: id });
    if (!job) throw new ApiError(req.__("Job not found"), 404);

    const savedJob = await this.jobRepository.deleteSavedJobBy({ user_id: user_id, job_id: id });
    if (!savedJob) {
      throw new ApiError(req.__("Saved job record not found"), 404);
    }

    if (job.numOfSaves > 0) {
      await this.jobRepository.findJobByAndUpdate({ job_id: id }, { numOfSaves: { decrement: 1 } });
    }

    return success(res, 200, { message: "Job saved successfully" });
  };
}
