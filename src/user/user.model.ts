import { Schema, model } from "mongoose";

const user = new Schema(
  {
    googleId: {
      type: String,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: Number,
      required: false,
      unique: true,
    },
    password: {
      type: String,
    },
    location: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    type: {
      type: String,
      enum: ["individual", "company"],
      default: "individual",
    },
    savedJob: [{ type: Schema.Types.ObjectId, ref: "jobs" }],
    codeValidation: String,
    codeValidationExpire: Date,
  },
  { timestamps: true }
);

export const User = model("users", user);
