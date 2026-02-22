/**
 * catchAsync – wraps async route handlers to avoid repetitive try/catch.
 *
 * Usage:
 *   router.get('/path', catchAsync(async (req, res, next) => { … }));
 *
 * Any rejected promise is automatically forwarded to Express's next(err).
 */
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default catchAsync;
