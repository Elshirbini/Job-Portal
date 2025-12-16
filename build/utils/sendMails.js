"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToEmails = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const apiError_1 = require("./apiError");
const dotenv_1 = require("dotenv");
const logger_1 = require("../config/logger");
(0, dotenv_1.configDotenv)();
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: "ahmedalshirbini33@gmail.com",
        pass: process.env.PASS_GMAIL_SERVICE,
    },
});
const sendToEmails = async (email, subject, html) => {
    const mailOptions = {
        from: "ahmedalshirbini33@gmail.com",
        to: email,
        subject: subject,
        html: html,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        logger_1.logger.info("Email sent: " + info.response);
        return info;
    }
    catch (error) {
        logger_1.logger.error(error);
        throw new apiError_1.ApiError("This email is invalid, please try another one", 403);
    }
};
exports.sendToEmails = sendToEmails;
