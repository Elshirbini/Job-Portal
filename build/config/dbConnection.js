"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnection = void 0;
const mongoose_1 = require("mongoose");
const logger_1 = require("./logger");
const dbConnection = async () => {
    try {
        await (0, mongoose_1.connect)(process.env.DB_URL, {
            serverSelectionTimeoutMS: 50000,
        });
        console.log("Connected to MongoDB");
    }
    catch (error) {
        logger_1.errorLogger.error(`Error connecting to MongoDB: ${error}`);
        throw error;
    }
};
exports.dbConnection = dbConnection;
