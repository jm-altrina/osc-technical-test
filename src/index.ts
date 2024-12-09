import 'reflect-metadata';
import { cleanEnv, str, port } from 'envalid';
import * as dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from './utils/logger';
import { connectDatabase } from './db';
import NodeCache from 'node-cache';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes/routes';

// Validate environment variables
const env = cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
    PORT: port({ default: 4000 }),
    DB_USER: str(),
    DB_PASSWORD: str(),
    DB_NAME: str(),
    DB_HOST: str(),
    DB_PORT: port({ default: 5432 }),
    DATABASE_URL: str(),
    JWT_SECRET: str(),
});

const app = express();
const prisma = new PrismaClient();
const PORT = env.PORT || 4000;

// In-memory cache
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }); // TTL: 1 hour

// Middleware to parse JSON
app.use(express.json());

// Middleware to set Cache-Control headers
app.use((req: Request, res: Response, next: NextFunction) => {
    res.set('Cache-Control', 'public, max-age=3600'); // Cache responses for 1 hour
    next();
});

(async () => {
    try {
        await connectDatabase();
        logger.info('Connected to the database!');

        if (env.NODE_ENV === 'production') {
            // Redirect HTTP to HTTPS in production
            app.use((req, res, next) => {
                // Check if the request is already secure
                const isSecure =
                    req.secure || // Standard secure request
                    req.headers['x-forwarded-proto'] === 'https'; // Check forwarded header for reverse proxies

                if (isSecure) {
                    next(); // Proceed to the next middleware or route
                } else {
                    // Redirect to HTTPS
                    res.redirect(`https://${req.headers.host}${req.url}`);
                }
            });
        }

        app.use(
            rateLimit({
                windowMs: 15 * 60 * 1000,
                max: 100,
                message: 'Too many requests, please try again later.',
            }),
        );

        // Health check route to ensure the server is running
        app.get('/health', (req: Request, res: Response) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            });
        });

        // Routes
        app.use(routes);

        // Error handling middleware (must come last)
        app.use(errorHandler);

        app.listen(PORT, () => logger.info(`Server running on port:${PORT}`));
    } catch (err) {
        if (err instanceof Error) {
            console.error('Connection failed:', err.message);
        } else {
            console.error('An unknown error occurred during connection.');
        }
    }
})();
