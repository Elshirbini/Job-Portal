import nodemailer from "nodemailer";
import { ApiError } from "./apiError";
import { configDotenv } from "dotenv";
import { errorLogger } from "../config/logger";
configDotenv();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ahmedalshirbini33@gmail.com",
    pass: process.env.PASS_GMAIL_SERVICE,
  },
});

export const sendToEmails = async (
  email: string,
  subject: string,
  html: string
) => {
  const mailOptions = {
    from: "ahmedalshirbini33@gmail.com",
    to: email,
    subject: subject,
    html: html,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    errorLogger.error(error);
    throw new ApiError("This email is invalid, please try another one", 403);
  }
};
