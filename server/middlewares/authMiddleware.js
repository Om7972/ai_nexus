import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

// ══════════════════════════════════════════════════════════════════════════════
// protect  –  Verify JWT & attach user to req
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Checks for a valid JWT in:
 *   1. Authorization: Bearer <token>   (REST clients / mobile)
 *   2. accessToken HTTP-only cookie    (browser sessions)
 *
 * Attaches the full user document to `req.user`.
 */
export const protect = catchAsync(async (req, res, next) => {
    // ── 1. Extract token ───────────────────────────────────────────────────────
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
    }

    if (!token) {
        return next(
            new AppError('You are not authenticated. Please log in to access this resource.', 401)
        );
    }

    // ── 2. Verify signature & expiry ───────────────────────────────────────────
    // verifyAccessToken will throw JsonWebTokenError / TokenExpiredError
    // which the global error handler normalises automatically.
    const decoded = verifyAccessToken(token);

    // ── 3. Check user still exists ─────────────────────────────────────────────
    const currentUser = await User.findById(decoded.id).select('+passwordChangedAt');
    if (!currentUser) {
        return next(new AppError('The account belonging to this token no longer exists.', 401));
    }

    // ── 4. Check password was not changed after token was issued ───────────────
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError(
                'Your password was recently changed. Please log in again to get a new token.',
                401
            )
        );
    }

    // ── 5. Attach user & proceed ───────────────────────────────────────────────
    req.user = currentUser;
    next();
});

// ══════════════════════════════════════════════════════════════════════════════
// restrictTo  –  Role-based access control (RBAC)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Factory that returns middleware restricting access to the given roles.
 *
 * Usage:
 *   router.delete('/:id', protect, restrictTo('admin'), deleteUser);
 *
 * @param  {...string} roles – Allowed roles (e.g. 'admin', 'user')
 */
export const restrictTo =
    (...roles) =>
        (req, res, next) => {
            if (!roles.includes(req.user.role)) {
                return next(
                    new AppError(
                        `Access denied. This route requires one of the following roles: ${roles.join(', ')}.`,
                        403
                    )
                );
            }
            next();
        };

// ══════════════════════════════════════════════════════════════════════════════
// isAdmin  –  Convenience shorthand for restrictTo('admin')
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Shorthand for `restrictTo('admin')`.
 * Always use after `protect`.
 *
 * Usage:
 *   router.get('/stats', protect, isAdmin, getStats);
 */
export const isAdmin = restrictTo('admin');

// ══════════════════════════════════════════════════════════════════════════════
// isVerified  –  Gate routes behind email verification
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Blocks access if the user's email address has not been verified.
 * Always use after `protect`.
 */
export const isVerified = (req, res, next) => {
    if (!req.user.isEmailVerified) {
        return next(
            new AppError(
                'Your email address is not verified. Please check your inbox for the verification link.',
                403
            )
        );
    }
    next();
};
