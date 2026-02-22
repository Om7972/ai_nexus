import { ZodError } from 'zod';
import AppError from '../utils/AppError.js';

/**
 * validate(schema) – Zod validation middleware factory.
 *
 * Usage:
 *   import { registerSchema } from '../validators/authValidators.js';
 *   router.post('/register', validate(registerSchema), authController.register);
 *
 * Validates req.body (extend to params/query as needed).
 */
const validate = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body); // mutates body with parsed/coerced data
        next();
    } catch (err) {
        if (err instanceof ZodError) {
            const errors = err.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            }));
            return next(new AppError('Validation failed', 422, errors));
        }
        next(err);
    }
};

export default validate;
