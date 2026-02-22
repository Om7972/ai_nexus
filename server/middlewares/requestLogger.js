import logger from '../utils/logger.js';

/**
 * HTTP request logger middleware.
 *
 * Logs: METHOD  PATH  STATUS  RESPONSE-TIME  IP
 *
 * Example output:
 *   [HTTP]  POST /api/v1/auth/login  201  45ms  ::1
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Hook into the 'finish' event so we capture the final status code
    res.on('finish', () => {
        const duration = Date.now() - start;
        const { method, originalUrl } = req;
        const { statusCode } = res;
        const ip = req.ip || req.socket?.remoteAddress || '-';

        logger.http(
            `${method.padEnd(6)} ${originalUrl.padEnd(40)} ${statusCode}  ${duration}ms  ${ip}`
        );
    });

    next();
};

export default requestLogger;
