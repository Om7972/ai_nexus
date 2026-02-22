/**
 * AppError – custom operational error class.
 *
 * Attach `statusCode` and `isOperational = true` so the global error handler
 * can distinguish between programmer errors and expected API errors.
 */
class AppError extends Error {
    /**
     * @param {string} message  – Human-readable error message.
     * @param {number} statusCode – HTTP status code (4xx / 5xx).
     * @param {object} [errors]  – Optional structured validation errors array.
     */
    constructor(message, statusCode, errors = null) {
        super(message);

        this.statusCode = statusCode;
        this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // distinguishes from unexpected crashes
        this.errors = errors; // e.g. Zod validation issues

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
