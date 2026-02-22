import * as authService from '../services/authService.js';
import catchAsync from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';

// ══════════════════════════════════════════════════════════════════════════════
// Public Endpoints
// ══════════════════════════════════════════════════════════════════════════════

/**
 * @desc    Register a new user – sends verification email
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = catchAsync(async (req, res) => {
    const { user, accessToken } = await authService.register(req.body, res);
    sendSuccess(
        res,
        201,
        { user, accessToken },
        'Account created successfully! A verification email has been sent to your inbox.'
    );
});

/**
 * @desc    Verify email using the token from the email link
 * @route   GET  /api/v1/auth/verify-email/:token
 * @access  Public
 */
export const verifyEmail = catchAsync(async (req, res) => {
    const { user, accessToken } = await authService.verifyEmail(req.params.token, res);
    sendSuccess(res, 200, { user, accessToken }, 'Email verified successfully. You are now logged in.');
});

/**
 * @desc    Login with email + password → returns accessToken + sets cookies
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = catchAsync(async (req, res) => {
    const { user, accessToken } = await authService.login(req.body, res);
    sendSuccess(res, 200, { user, accessToken }, 'Logged in successfully.');
});

/**
 * @desc    Issue a new access token using the refresh token cookie
 * @route   POST /api/v1/auth/refresh
 * @access  Public (requires valid refresh token cookie)
 */
export const refresh = catchAsync(async (req, res) => {
    // Prefer cookie; fallback to body for mobile/non-browser clients
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    const { accessToken } = await authService.refreshAccessToken(token, res);
    sendSuccess(res, 200, { accessToken }, 'Access token refreshed.');
});

/**
 * @desc    Send a password-reset link to the user's email
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = catchAsync(async (req, res) => {
    await authService.forgotPassword(req.body.email);
    // Generic success – never reveal whether the email exists
    sendSuccess(
        res,
        200,
        null,
        'If an account with that email exists, a password reset link has been sent.'
    );
});

/**
 * @desc    Reset password using the token from the email link
 * @route   POST /api/v1/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = catchAsync(async (req, res) => {
    const { user, accessToken } = await authService.resetPassword(
        req.params.token,
        req.body.password,
        res
    );
    sendSuccess(res, 200, { user, accessToken }, 'Password reset successfully. You are now logged in.');
});

// ══════════════════════════════════════════════════════════════════════════════
// Protected Endpoints  (require valid JWT via protect middleware)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * @desc    Logout – clears cookies and revokes refresh token
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = catchAsync(async (req, res) => {
    await authService.logout(req.user._id, res);
    sendSuccess(res, 200, null, 'Logged out successfully.');
});

/**
 * @desc    Get currently authenticated user
 * @route   GET  /api/v1/auth/me
 * @access  Private
 */
export const getMe = catchAsync(async (req, res) => {
    const user = await authService.getMe(req.user._id);
    sendSuccess(res, 200, { user });
});

/**
 * @desc    Change password (authenticated user who knows current password)
 * @route   PATCH /api/v1/auth/change-password
 * @access  Private
 */
export const changePassword = catchAsync(async (req, res) => {
    const { accessToken } = await authService.changePassword(req.user._id, req.body, res);
    sendSuccess(res, 200, { accessToken }, 'Password changed successfully.');
});

/**
 * @desc    Resend the verification email (for unverified accounts)
 * @route   POST /api/v1/auth/resend-verification
 * @access  Private
 */
export const resendVerification = catchAsync(async (req, res) => {
    await authService.resendVerificationEmail(req.user._id);
    sendSuccess(res, 200, null, 'Verification email sent. Please check your inbox.');
});
