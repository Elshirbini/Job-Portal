"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18n_1 = __importDefault(require("i18n"));
const path_1 = __importDefault(require("path"));
i18n_1.default.configure({
    locales: ["en", "ar"], // اللغات المدعومة
    defaultLocale: "en", // اللغة الافتراضية
    directory: path_1.default.join(__dirname, "../locales"), // مكان ملفات الترجمة
    header: "x-user-lang", // هيدر مخصص
    autoReload: true, // يحدث تلقائي لو الملفات اتعدلت
    syncFiles: true, // ينشئ keys ناقصة
    objectNotation: true, // دعم nested keys (اختياري)
});
exports.default = i18n_1.default;
