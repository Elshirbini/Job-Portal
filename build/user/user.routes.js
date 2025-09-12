"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
const verifyToken_1 = require("../middlewares/verifyToken");
const user_controller_1 = require("./user.controller");
const user_validator_1 = require("./user.validator");
const validateInputs_1 = require("../middlewares/validateInputs");
const router = express_1.default.Router();
router.patch("/:id", verifyToken_1.verifyToken, user_validator_1.updateUserValidation, validateInputs_1.validateInputs, user_controller_1.updateUser);
exports.userRoutes = router;
