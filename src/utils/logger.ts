import winston from "winston";
import { env } from "../config/env";

const { colorize, combine, metadata, printf, timestamp } = winston.format;

const logforamt = printf((info) => {
  return `${info.timestamp} [${info.level}] ${info.message}${
    info.metadata && Object.keys(info.metadata).length
      ? ` - ${JSON.stringify(info.metadata)}`
      : ""
  }`;
});

export const logger = winston.createLogger({
  level: env.NODE_ENV === "prodution" ? "info" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    metadata({ fillExcept: ["message", "level", "timestamp"] }),
    logforamt
  ),
  transports: [
    new winston.transports.Console({
      format: combine(colorize({ all: true }), logforamt),
    }),
  ],
});

export const Logger = typeof logger;
