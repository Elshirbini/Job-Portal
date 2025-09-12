"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const user = new mongoose_1.Schema({
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
    savedJob: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "jobs" }],
    codeValidation: String,
    codeValidationExpire: Date,
}, { timestamps: true });
exports.User = (0, mongoose_1.model)("users", user);
