import pkg from 'pg';
import dotenv from 'dotenv';
import logger from './utils/logger';

dotenv.config();

const { Pool } = pkg;

// Validate environment variables
if (
    !process.env.DB_USER ||
    !process.env.DB_PASSWORD ||
    !process.env.DB_HOST ||
    !process.env.DB_NAME ||
    !process.env.DB_PORT
) {
    throw new Error('Missing required database environment variables.');
}

// Create the database pool
export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD as string, // Ensure password is a string
    port: Number(process.env.DB_PORT),
    ...(process.env.NODE_ENV === 'production' && {
        ssl: {
            // WARNING: Setting "rejectUnauthorized: false" disables SSL certificate validation.
            // This is NOT recommended for production environments as it exposes the connection
            // to potential man-in-the-middle attacks. Use a valid SSL certificate in production.
            rejectUnauthorized: false,
        },
    }),
});

// Test database connection
export const connectDatabase = async () => {
    try {
        await pool.connect();
        logger.info('Connected to the database!');
    } catch (err) {
        // Narrow down the type of 'err' to properly handle it
        if (err instanceof Error) {
            console.error('Database connection failed:', err.message);
        } else {
            console.error(
                'An unknown error occurred during database connection.',
            );
        }
        process.exit(1); // Exit process on failure
    }
};
