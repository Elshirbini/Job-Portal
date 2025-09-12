import { Schema, model } from "mongoose";

const job = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
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

export const Job = model("jobs", job);
