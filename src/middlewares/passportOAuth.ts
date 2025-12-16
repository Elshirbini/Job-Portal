import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { configDotenv } from "dotenv";
import { ApiError } from "../utils/apiError";
import { logger } from "../config/logger";
import { NextFunction, Request, Response } from "express";
import { sendToEmails } from "../utils/sendMails";
import { generateAccessToken } from "../utils/tokens.util";
import {
  createUser,
  findUserBy,
  findUserByAndUpdate,
} from "../user/user.repository";

configDotenv();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:
        process.env.NODE_ENV === "prod"
          ? process.env.GOOGLE_CALLBACK_URL_PROD
          : process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
      scope: ["email", "profile"],
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails?.[0]?.value || !profile.name) {
          return done(new ApiError(req.__("Data is uncompleted"), 400), false);
        }

        let user = await findUserBy({ google_id: profile.id });

        if (!user) {
          const existingUser = await findUserBy({
            email: profile.emails[0].value,
          });

          if (existingUser) {
            user = await findUserByAndUpdate(
              { user_id: existingUser.user_id },
              { google_id: profile.id }
            );
          } else {
            user = await createUser({
              google_id: profile.id,
              full_name: `${profile.name.givenName} ${profile.name.familyName}`,
              email: profile.emails[0].value,
            });

            await sendToEmails(user.email, "Welcome", user.full_name);
          }
        }

        const token = await generateAccessToken(user.user_id, user.role);
        return done(null, { token, role: user.role });
      } catch (error) {
        logger.error(error);
        return done(error, false);
      }
    }
  )
);

export const oAuthenticated = passport.authenticate("google", {
  scope: ["email", "profile"],
  prompt: "select_account", // لإعادة طلب الكود عند كل طلب
});

export const oCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("google", { session: false }, (err, user, info) => {
    if (err) {
      logger.error("Passport Error:", err);
      return res.redirect(
        (process.env.NODE_ENV === "prod"
          ? process.env.GOOGLE_failed_CALLBACK_URL_PROD
          : process.env.GOOGLE_failed_CALLBACK_URL) +
          `?error=${encodeURIComponent(err.message)}`
      );
    }

    if (!user) {
      return res.redirect(
        (process.env.NODE_ENV === "prod"
          ? process.env.GOOGLE_failed_CALLBACK_URL_PROD
          : process.env.GOOGLE_failed_CALLBACK_URL) +
          `?error=${encodeURIComponent("Authentication Failed")}`
      );
    }

    req.user = user;
    next();
  })(req, res, next);
};
