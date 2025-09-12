"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = void 0;
const crypto_1 = require("crypto");
const generateOTP = () => (0, crypto_1.randomInt)(1000, 9999).toString();
exports.generateOTP = generateOTP;
