"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const logger_1 = require("./logger");
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const redisClient = (0, redis_1.createClient)({
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    },
    password: process.env.REDIS_PASS,
});
redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.connect();
logger_1.logger.info("Connected to Redis");
exports.default = redisClient;
