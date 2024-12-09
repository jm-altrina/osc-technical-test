/**
 * @file logger.ts
 * @description This file sets up a centralized logging utility using the `winston` library.
 * It creates a logger instance configured to output logs in JSON format to the console.
 * 
 * The logger can be used throughout the application for consistent and centralised logging.
 */
import winston from 'winston';

// Create a Winston logger instance with configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
});

export default logger;
