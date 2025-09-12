"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const dbConnection_1 = require("./config/dbConnection");
const logger_1 = require("./config/logger");
dotenv_1.default.config();
app_1.default.listen(8080, "0.0.0.0", () => {
    (0, dbConnection_1.dbConnection)();
    console.log(`🚀 Server running on PORT:${process.env.PORT}`);
});
process.on("unhandledRejection", (err) => {
    logger_1.errorLogger.error(`Unhandled Rejection Errors : ${err.name} | ${err.message}`);
    process.exit(1);
});
process.on("uncaughtException", (err) => {
    logger_1.errorLogger.error(`Unhandled Caught Errors : ${err.name} | ${err.message}`);
    process.exit(1);
});
