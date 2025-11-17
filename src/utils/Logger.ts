import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

class Logger {
  public logger: winston.Logger;

  constructor() {
    const logLevel = process.env.LOG_LEVEL || 'info';
    
    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'discord-bot' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
      ]
    });
  }

  public info(message: string, context?: string): void {
    this.logger.info(message, { context });
  }

  public warn(message: string, context?: string): void {
    this.logger.warn(message, { context });
  }

  public error(message: string, error?: any, context?: string): void {
    this.logger.error(message, { error: error?.stack || error, context });
  }

  public debug(message: string, context?: string): void {
    this.logger.debug(message, { context });
  }

  public success(message: string, context?: string): void {
    this.logger.info(`✅ ${message}`, { context });
  }

  public performance(message: string, duration: number, context?: string): void {
    this.logger.info(`⏱️ ${message}: ${duration}ms`, { context });
  }
}

export const logger = new Logger();
export default logger;