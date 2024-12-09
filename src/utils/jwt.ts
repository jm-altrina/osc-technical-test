import jwt from 'jsonwebtoken';
import { TokenPayload } from './tokenPayload.type';

const JWT_SECRET = process.env.JWT_SECRET || 'defaultSecretKey'; // Use an environment variable for security
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h'; // Default expiration time

/**
 * Generate a JWT token
 * @param payload - The payload to encode in the token
 * @returns {string} - The signed JWT token
 */
export const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

/**
 * Verify and decode a JWT token
 * @param token - The token to verify
 * @returns {object | string} - The decoded payload
 * @throws {Error} - Throws an error if the token is invalid or expired
 */
export const verifyToken = (token: string): object | string => {
    return jwt.verify(token, JWT_SECRET);
};

/**
 * Decode a JWT token without verifying
 * @param token - The token to decode
 * @returns {null | object} - The decoded payload, or null if invalid
 */
export const decodeToken = (token: string): object | null => {
    try {
        const decoded = jwt.decode(token);

        // Type narrowing to ensure it's an object
        if (typeof decoded === 'object' && decoded !== null) {
            return decoded;
        }

        return null; // Return null if it's not an object
    } catch (err) {
        if (err instanceof Error) {
            console.error('[JWT Decode Error]:', err.message);
        } else {
            console.error('And Error occured while decoding JWT');
        }
        return null;
    }
};
