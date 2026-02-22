/**
 * apiResponse – helpers that standardise every JSON response shape.
 *
 * Success:  { success: true,  data: {…},    message: "…" }
 * Error:    { success: false, error: {…},   message: "…" }
 * Paginated:{ success: true,  data: […],   meta: { page, limit, total, pages } }
 */

/**
 * @param {import('express').Response} res
 * @param {number}  statusCode
 * @param {any}     data
 * @param {string}  [message]
 */
export const sendSuccess = (res, statusCode = 200, data = null, message = 'Success') => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/**
 * @param {import('express').Response} res
 * @param {number}  statusCode
 * @param {string}  message
 * @param {any}     [errors]
 */
export const sendError = (res, statusCode = 500, message = 'Something went wrong', errors = null) => {
    const body = { success: false, message };
    if (errors) body.errors = errors;
    return res.status(statusCode).json(body);
};

/**
 * @param {import('express').Response} res
 * @param {Array}   data
 * @param {{ page: number, limit: number, total: number }} meta
 * @param {string}  [message]
 */
export const sendPaginated = (res, data, { page, limit, total }, message = 'Success') =>
    res.status(200).json({
        success: true,
        message,
        meta: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
        data,
    });
