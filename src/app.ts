import express from "express";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import { configDotenv } from "dotenv";
import { errorHandling } from "./middlewares/errorHandling";
import { httpLoggerMiddleware } from "./middlewares/httpLogger";
import path from "path";
import { authRoutes } from "./auth/auth.routes";
import { userRoutes } from "./user/user.routes";
import { jobRoutes } from "./job/job.routes";
import i18n from "./config/i18n";
configDotenv();

const app = express();

//                        **Middlewares**

app.use(httpLoggerMiddleware);
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:8080"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(compression());
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-site" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,
  })
);
app.use(i18n.init);

//                                 **ROUTES**

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/job", jobRoutes);

// app.use(express.static(path.join(__dirname, "dist")));

// // Fallback to index.html for other routes (for React Router)

// app.use((req, res, next) => {
//   if (req.path.startsWith("/api")) {
//     return res.status(404).json({ message: "API route not found" });
//   }
//   res.sendFile(path.join(__dirname, "dist", "index.html"));
// });
//                                 **Global Error Handler**

app.use(errorHandling);

export default app;
