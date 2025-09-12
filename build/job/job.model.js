"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const mongoose_1 = require("mongoose");
const job = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    requirements: {
        type: [String],
        required: true,
    },
    keyResponsibilities: {
        type: [String],
        required: true,
    },
    qualifications: {
        type: [String],
        required: true,
    },
    benefits: {
        type: [String],
        required: true,
    },
    attendanceType: {
        type: String,
        enum: ["remote", "hybrid", "on-site"],
        required: true,
    },
    employmentType: {
        type: [String],
        enum: ["full-time", "part-time", "freelance", "internship"],
        required: true,
    },
    numOfSaves: {
        type: Number,
        default: 0,
    },
});
exports.Job = (0, mongoose_1.model)("jobs", job);
