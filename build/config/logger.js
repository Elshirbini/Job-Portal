"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = exports.httpLogger = exports.infoLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, printf, colorize } = winston_1.default.format;
const logFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
});
const baseFormat = combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat);
// Logger للمستوى info فقط
exports.infoLogger = winston_1.default.createLogger({
    level: "info",
    format: baseFormat,
    transports: [new winston_1.default.transports.Console({ level: "info" })],
});
// Logger للمستوى http فقط
exports.httpLogger = winston_1.default.createLogger({
    level: "http",
    format: baseFormat,
    transports: [new winston_1.default.transports.Console({ level: "http" })],
});
// Logger للمستوى error فقط
exports.errorLogger = winston_1.default.createLogger({
    level: "error",
    format: baseFormat,
    transports: [new winston_1.default.transports.Console({ level: "error" })],
});
