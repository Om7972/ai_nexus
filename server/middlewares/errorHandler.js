import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

// ── Mongoose-specific error transformers ──────────────────────────────────────

const handleCastErrorDB = (err) =>
    new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateFieldsDB = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return new AppError(`Duplicate field value: "${value}" for field "${field}". Please use another value.`, 409);
};

const handleValidationErrorDB = (err) => {
    const messages = Object.values(err.errors).map((e) => e.message);
    return new AppError(`Validation failed: ${messages.join('. ')}`, 422);
};

// ── JWT error transformers ────────────────────────────────────────────────────

const handleJWTError = () =>
    new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
    new AppError('Your token has expired. Please log in again.', 401);

// ── Zod error transformer ────────────────────────────────────────────────────

const handleZodError = (err) => {
    const errors = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
    }));
    return new AppError('Validation failed', 422, errors);
};

// ── Dev vs Production error response ─────────────────────────────────────────

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err.message,
        errors: err.errors || undefined,
        stack: err.stack,
        error: err,
    });
};

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        // Trusted, expected errors – send message to client
        res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message,
            errors: err.errors || undefined,
        });
    } else {
        // Unknown / programmer error – do NOT leak details
        logger.error(`💥 Unexpected error: ${err}`);
        res.status(500).json({
            success: false,
            status: 'error',
            message: 'Something went wrong. Please try again later.',
        });
    }
};

// ── Global error-handling middleware ─────────────────────────────────────────

/**
 * Must be registered LAST in app.js after all routes.
 * Express identifies 4-argument middleware as error handlers.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    let error = { ...err, message: err.message, name: err.name };

    // Map known error types to operational AppErrors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (error.name === 'ZodError') error = handleZodError(error);

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, res);
    } else {
        sendErrorProd(error, res);
    }
};

export default errorHandler;
