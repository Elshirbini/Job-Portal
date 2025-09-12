"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandling = void 0;
const logger_1 = require("../config/logger");
const errorHandling = (err, req, res, next) => {
    logger_1.errorLogger.error(err);
    err.statusCode = err.statusCode || 500;
    if (process.env.NODE_ENV === "dev") {
        sendErrForDev(err, res);
    }
    else {
        sendErrForProd(err, res);
    }
};
exports.errorHandling = errorHandling;
const sendErrForDev = (err, res) => {
    return res.status(err.statusCode).json({
        success: false,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};
const sendErrForProd = (err, res) => {
    return res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
