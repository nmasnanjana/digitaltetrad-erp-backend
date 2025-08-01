import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

const logFormat = winston.format.printf(({ timestamp, level, message,  }) => {
    return JSON.stringify({
        timestamp,
        level,
        message
    });
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        logFormat  // Ensure logs are in JSON format
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                logFormat  // Use JSON format for console too
            ),
        }),
    ],
});

if (process.env.ENVIRONMENT === 'production') {
    logger.add(
        new winston.transports.File({
            filename: 'logs/server.log',
            format: winston.format.combine(
                winston.format.timestamp(),
                logFormat  // Use JSON format for file logging
            ),
        })
    );
}

export default logger;
