"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsaveJob = exports.saveJob = exports.getAllJobs = exports.getJob = exports.deleteJob = exports.updateJob = exports.addJob = void 0;
const apiError_1 = require("../utils/apiError");
const job_model_1 = require("./job.model");
const response_1 = require("../utils/response");
const addJob = async (req, res) => {
    const { title, description, requirements, qualifications, keyResponsibilities, benefits, attendanceType, employmentType, } = req.body;
    const { id } = req.params;
    const userId = req.userId;
    if (id !== userId)
        throw new apiError_1.ApiError(req.__("wrong credentials"), 404);
    await job_model_1.Job.create({
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
    return (0, response_1.success)(res, 201, { message: "Job posted successfully" });
};
exports.addJob = addJob;
const updateJob = async (req, res) => {
    const { title, description, requirements, qualifications, keyResponsibilities, benefits, attendanceType, employmentType, } = req.body;
    const { id } = req.params;
    const userId = req.userId;
    const job = await job_model_1.Job.findOneAndUpdate({ _id: id, userId: userId }, {
        id,
        title,
        description,
        requirements,
        qualifications,
        keyResponsibilities,
        benefits,
        attendanceType,
        employmentType,
    }, { new: true, runValidators: true });
    if (!job)
        throw new apiError_1.ApiError(req.__("Job not found"), 404);
    return (0, response_1.success)(res, 200, { message: "Job updated successfully" });
};
exports.updateJob = updateJob;
const deleteJob = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    const job = await job_model_1.Job.findOneAndDelete({ _id: id, userId: userId });
    if (!job)
        throw new apiError_1.ApiError(req.__("Job not found"), 404);
    return (0, response_1.success)(res, 200, { message: "Job deleted successfully" });
};
exports.deleteJob = deleteJob;
const getJob = async (req, res) => {
    const { id } = req.params;
    const job = await job_model_1.Job.findById(id).populate("userId", "fullName location");
    if (!job)
        throw new apiError_1.ApiError(req.__("Job not found"), 404);
    return (0, response_1.success)(res, 200, { job });
};
exports.getJob = getJob;
const getAllJobs = async (req, res) => {
    const jobs = await job_model_1.Job.find();
    return (0, response_1.success)(res, 200, { jobs });
};
exports.getAllJobs = getAllJobs;
const saveJob = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    const job = await job_model_1.Job.findById(id).select("_id");
    if (!job)
        throw new apiError_1.ApiError(req.__("Job not found"), 404);
    // const user = await User.findByIdAndUpdate(
    //   userId,
    //   { $addToSet: { savedJob: job._id } },
    //   { new: true, runValidators: true }
    // );
    // if (!user) throw new ApiError(req.__("User not found"), 404);
    job.numOfSaves += 1;
    await job.save();
    return (0, response_1.success)(res, 200, { message: "Job saved successfully" });
};
exports.saveJob = saveJob;
const unsaveJob = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    const job = await job_model_1.Job.findById(id).select("_id");
    if (!job)
        throw new apiError_1.ApiError(req.__("Job not found"), 404);
    // const user = await User.findByIdAndUpdate(
    //   userId,
    //   { $pull: { savedJob: job._id } },
    //   { new: true, runValidators: true }
    // );
    // if (!user) throw new ApiError(req.__("User not found"), 404);
    if (job.numOfSaves > 0) {
        job.numOfSaves -= 1;
        await job.save();
    }
    return (0, response_1.success)(res, 200, { message: "Job saved successfully" });
};
exports.unsaveJob = unsaveJob;
