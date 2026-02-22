import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
} from '../validators/authValidators.js';

const router = Router();

// ══════════════════════════════════════════════════════════════════════════════
//  PUBLIC ROUTES  – no authentication required
// ══════════════════════════════════════════════════════════════════════════════

/**
 * @route   POST /api/v1/auth/register
 * @desc    Create account & send verification email
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @route   GET  /api/v1/auth/verify-email/:token
 * @desc    Verify email address via token from email link
 */
router.get('/verify-email/:token', authController.verifyEmail);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user & return access token + set cookies
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Issue a new access token using the refresh token cookie
 */
router.post('/refresh', authController.refresh);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password-reset link to email
 */
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password/:token
 * @desc    Reset password using token from email link (valid 10 min)
 */
router.post(
    '/reset-password/:token',
    validate(resetPasswordSchema),
    authController.resetPassword
);

// ══════════════════════════════════════════════════════════════════════════════
//  PROTECTED ROUTES  – valid JWT required
// ══════════════════════════════════════════════════════════════════════════════

router.use(protect); // ← all routes below are guarded

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Revoke refresh token & clear cookies
 */
router.post('/logout', authController.logout);

/**
 * @route   GET  /api/v1/auth/me
 * @desc    Get the currently authenticated user
 */
router.get('/me', authController.getMe);

/**
 * @route   PATCH /api/v1/auth/change-password
 * @desc    Change password (requires current password)
 */
router.patch(
    '/change-password',
    validate(changePasswordSchema),
    authController.changePassword
);

/**
 * @route   POST /api/v1/auth/resend-verification
 * @desc    Re-send verification email for unverified accounts
 */
router.post('/resend-verification', authController.resendVerification);

export default router;
