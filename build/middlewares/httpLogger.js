"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLoggerMiddleware = void 0;
const logger_1 = require("../config/logger");
const httpLoggerMiddleware = (req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const { method, originalUrl } = req;
        const { statusCode } = res;
        const duration = Date.now() - start;
        const logMessage = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;
        logger_1.httpLogger.http(logMessage);
    });
    next();
};
exports.httpLoggerMiddleware = httpLoggerMiddleware;
