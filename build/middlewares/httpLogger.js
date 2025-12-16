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
        const logMessage = `${method} ${originalUrl} ${statusCode} - ${duration}ms - ${req.headers["content-length"]} byte`;
        logger_1.logger.http(logMessage);
    });
    next();
};
exports.httpLoggerMiddleware = httpLoggerMiddleware;
