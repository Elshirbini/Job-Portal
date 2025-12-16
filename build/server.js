"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("./config/logger");
const prisma_1 = require("./prisma");
dotenv_1.default.config();
async function start() {
    try {
        await prisma_1.prisma.$connect();
        logger_1.logger.info("✅ Prisma connected to PostgreSQL successfully!");
        app_1.default.listen(8080, "0.0.0.0", () => {
            logger_1.logger.info(`🚀 Server running on PORT:${process.env.PORT}`);
        });
    }
    catch (error) {
        logger_1.logger.error("❌ Failed to connect to the database:", error);
        process.exit(1);
    }
}
start();
process.on("unhandledRejection", (err) => {
    logger_1.logger.error(`Unhandled Rejection Errors : ${err.name} | ${err.message}`);
    process.exit(1);
});
process.on("uncaughtException", (err) => {
    logger_1.logger.error(`Unhandled Caught Errors : ${err.name} | ${err.message}`);
    process.exit(1);
});
