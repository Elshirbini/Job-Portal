"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oCallback = exports.oAuthenticated = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const dotenv_1 = require("dotenv");
const apiError_1 = require("../utils/apiError");
const logger_1 = require("../config/logger");
const sendMails_1 = require("../utils/sendMails");
const tokens_util_1 = require("../utils/tokens.util");
const user_repository_1 = require("../user/user.repository");
(0, dotenv_1.configDotenv)();
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === "prod"
        ? process.env.GOOGLE_CALLBACK_URL_PROD
        : process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true,
    scope: ["email", "profile"],
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        if (!profile.emails?.[0]?.value || !profile.name) {
            return done(new apiError_1.ApiError(req.__("Data is uncompleted"), 400), false);
        }
        let user = await (0, user_repository_1.findUserBy)({ google_id: profile.id });
        if (!user) {
            const existingUser = await (0, user_repository_1.findUserBy)({
                email: profile.emails[0].value,
            });
            if (existingUser) {
                user = await (0, user_repository_1.findUserByAndUpdate)({ user_id: existingUser.user_id }, { google_id: profile.id });
            }
            else {
                user = await (0, user_repository_1.createUser)({
                    google_id: profile.id,
                    full_name: `${profile.name.givenName} ${profile.name.familyName}`,
                    email: profile.emails[0].value,
                });
                await (0, sendMails_1.sendToEmails)(user.email, "Welcome", user.full_name);
            }
        }
        const token = await (0, tokens_util_1.generateAccessToken)(user.user_id, user.role);
        return done(null, { token, role: user.role });
    }
    catch (error) {
        logger_1.logger.error(error);
        return done(error, false);
    }
}));
exports.oAuthenticated = passport_1.default.authenticate("google", {
    scope: ["email", "profile"],
    prompt: "select_account", // لإعادة طلب الكود عند كل طلب
});
const oCallback = (req, res, next) => {
    passport_1.default.authenticate("google", { session: false }, (err, user, info) => {
        if (err) {
            logger_1.logger.error("Passport Error:", err);
            return res.redirect((process.env.NODE_ENV === "prod"
                ? process.env.GOOGLE_failed_CALLBACK_URL_PROD
                : process.env.GOOGLE_failed_CALLBACK_URL) +
                `?error=${encodeURIComponent(err.message)}`);
        }
        if (!user) {
            return res.redirect((process.env.NODE_ENV === "prod"
                ? process.env.GOOGLE_failed_CALLBACK_URL_PROD
                : process.env.GOOGLE_failed_CALLBACK_URL) +
                `?error=${encodeURIComponent("Authentication Failed")}`);
        }
        req.user = user;
        next();
    })(req, res, next);
};
exports.oCallback = oCallback;
