import winston from "winston";
const { format, createLogger, transports } = winston;

const winstonFormat = format.printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} - ${level} - ${stack || message}`;
});

export const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), winstonFormat, format.colorize()),
  transports: [new transports.Console()],
});
