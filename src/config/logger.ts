import winston from "winston";

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

const baseFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  logFormat
);

// Logger للمستوى info فقط
export const infoLogger = winston.createLogger({
  level: "info",
  format: baseFormat,
  transports: [new winston.transports.Console({ level: "info" })],
});

// Logger للمستوى http فقط
export const httpLogger = winston.createLogger({
  level: "http",
  format: baseFormat,
  transports: [new winston.transports.Console({ level: "http" })],
});

// Logger للمستوى error فقط
export const errorLogger = winston.createLogger({
  level: "error",
  format: baseFormat,
  transports: [new winston.transports.Console({ level: "error" })],
});
