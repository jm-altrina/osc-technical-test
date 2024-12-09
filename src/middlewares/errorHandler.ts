import { Request, Response, NextFunction } from 'express';

// Error handling middleware
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    console.error(`[ERROR]: ${err.message}`, err.stack); // Log the error for debugging

    // Check if `res.status` is available
    if (res && typeof res.status === 'function') {
        // Send a response to the client
        res.status(500).json({
            success: false,
            message: err.message || 'Internal Server Error',
        });
    } else {
        // If `res` is not valid, pass the error to the next middleware
        next(err);
    }
};
