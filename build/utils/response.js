"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = void 0;
const success = (res, statusCode, data = {}) => {
    return res.status(statusCode).json({ success: true, data: data });
};
exports.success = success;
