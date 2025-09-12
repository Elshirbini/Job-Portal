"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const errorHandling_1 = require("./middlewares/errorHandling");
const httpLogger_1 = require("./middlewares/httpLogger");
const auth_routes_1 = require("./auth/auth.routes");
const user_routes_1 = require("./user/user.routes");
const job_routes_1 = require("./job/job.routes");
const i18n_1 = __importDefault(require("./config/i18n"));
(0, dotenv_1.configDotenv)();
const app = (0, express_1.default)();
//                        **Middlewares**
app.use(httpLogger_1.httpLoggerMiddleware);
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://localhost:8080"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use((0, compression_1.default)());
app.use((0, helmet_1.default)({
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
}));
app.use(i18n_1.default.init);
//                                 **ROUTES**
app.use("/api/v1/auth", auth_routes_1.authRoutes);
app.use("/api/v1/user", user_routes_1.userRoutes);
app.use("/api/v1/job", job_routes_1.jobRoutes);
// app.use(express.static(path.join(__dirname, "dist")));
// // Fallback to index.html for other routes (for React Router)
// app.use((req, res, next) => {
//   if (req.path.startsWith("/api")) {
//     return res.status(404).json({ message: "API route not found" });
//   }
//   res.sendFile(path.join(__dirname, "dist", "index.html"));
// });
//                                 **Global Error Handler**
app.use(errorHandling_1.errorHandling);
exports.default = app;
