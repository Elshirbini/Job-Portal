"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = void 0;
const success = (res, statusCode, data = null) => {
    if (typeof data === "string") {
        return res.status(statusCode).json({ success: true, message: data });
    }
    return res.status(statusCode).json({ success: true, ...data });
};
exports.success = success;
