"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerStream = exports.logger = void 0;
// logger.ts
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
const { combine, timestamp, printf, colorize, errors, splat } = winston_1.default.format;
// custom levels including 'http'
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
winston_1.default.addColors({
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "gray",
});
const logFormat = printf((info) => {
    const { level, timestamp } = info;
    let msg = info.stack || info.message;
    // لو مش primitive → حاول نحوله JSON
    if (msg !== null && typeof msg === "object") {
        try {
            msg = JSON.stringify(msg);
        }
        catch {
            msg = "[Unserializable object]";
        }
    }
    // safety net إجباري
    msg = String(msg);
    return `[${timestamp}] ${level}: ${msg}`;
});
const baseFormat = combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), errors({ stack: true }), splat(), logFormat);
const consoleFormat = combine(colorize({ all: true }), baseFormat);
const dailyRotate = new winston_1.default.transports.DailyRotateFile({
    dirname: "logs", // same folder
    filename: "app-%DATE%.log", // one file per day
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d", // keep 14 days of logs
    level: "debug", // include EVERYTHING
});
exports.logger = winston_1.default.createLogger({
    levels,
    format: baseFormat,
    transports: [
        new winston_1.default.transports.Console({
            format: consoleFormat,
        }),
        dailyRotate,
    ],
});
// For HTTP logging (express)
exports.loggerStream = {
    write: (message) => {
        exports.logger.http(message.trim());
    },
};
