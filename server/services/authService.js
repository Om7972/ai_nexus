import crypto from 'crypto';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { sendTokens, clearTokens, verifyRefreshToken } from '../utils/jwt.js';
import {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendPasswordChangedEmail,
} from './emailService.js';

// ══════════════════════════════════════════════════════════════════════════════
// 1. REGISTER
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Create account → auto-login → send verification email in background.
 * Returns { user, accessToken } so the frontend navigates directly to the dashboard.
 */
export const register = async ({ name, email, password }, res) => {
    // Duplicate check
    const existing = await User.findOne({ email }).select('+isActive');
    if (existing) throw new AppError('An account with this email already exists.', 409);

    // Role Assignment
    let role = 'user';
    let plan = 'free';

    if (email.toLowerCase() === 'odhumkekar@gmail.com') {
        role = 'admin';
        plan = 'enterprise';
    }

    const user = await User.create({ name, email, password, role, plan });

    // Generate email verification token (stored, non-blocking send)
    const verifyToken = user.createEmailVerificationToken();

    // Issue access + refresh tokens immediately (auto-login)
    const { accessToken, refreshToken } = sendTokens(res, user);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Fire-and-forget verification email – never block the sign-up response
    sendVerificationEmail({ name: user.name, email: user.email, token: verifyToken }).catch(
        (err) => console.error('[emailService] Verification email failed:', err.message)
    );

    return { user: user.toSafeObject(), accessToken };
};

// ══════════════════════════════════════════════════════════════════════════════
// 2. VERIFY EMAIL
// ══════════════════════════════════════════════════════════════════════════════

export const verifyEmail = async (rawToken, res) => {
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) throw new AppError('Token is invalid or has expired.', 400);

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Auto-login after verification
    const { accessToken, refreshToken } = sendTokens(res, user);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { user: user.toSafeObject(), accessToken };
};

// ══════════════════════════════════════════════════════════════════════════════
// 3. LOGIN
// ══════════════════════════════════════════════════════════════════════════════

export const login = async ({ email, password }, res) => {
    console.log(`[AuthService] Attempting login for email: ${email}`);
    const user = await User.findOne({ email }).select('+password +refreshToken');

    if (!user) {
        console.log(`[AuthService] Login failed: User not found for email ${email}`);
        throw new AppError('Invalid email or password.', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        console.log(`[AuthService] Login failed: Password mismatch for email ${email}`);
        throw new AppError('Invalid email or password.', 401);
    }

    console.log(`[AuthService] Login successful for email ${email}`);
    const { accessToken, refreshToken } = sendTokens(res, user);

    // Store refresh token (for rotation & revocation)
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { user: user.toSafeObject(), accessToken };
};

// ══════════════════════════════════════════════════════════════════════════════
// 4. LOGOUT
// ══════════════════════════════════════════════════════════════════════════════

export const logout = async (userId, res) => {
    clearTokens(res);
    await User.findByIdAndUpdate(userId, { refreshToken: null });
};

// ══════════════════════════════════════════════════════════════════════════════
// 5. REFRESH ACCESS TOKEN
// ══════════════════════════════════════════════════════════════════════════════

export const refreshAccessToken = async (incomingRefreshToken, res) => {
    if (!incomingRefreshToken) throw new AppError('No refresh token provided.', 401);

    let decoded;
    try {
        decoded = verifyRefreshToken(incomingRefreshToken);
    } catch {
        throw new AppError('Refresh token is invalid or expired. Please log in again.', 401);
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== incomingRefreshToken) {
        throw new AppError('Refresh token has been revoked. Please log in again.', 401);
    }

    // Rotate – issue new pair
    const { accessToken, refreshToken: newRefreshToken } = sendTokens(res, user);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken };
};

// ══════════════════════════════════════════════════════════════════════════════
// 6. FORGOT PASSWORD
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a password-reset token and email it to the user.
 * Always returns a generic success message to prevent user enumeration.
 */
export const forgotPassword = async (email) => {
    const user = await User.findOne({ email });
    // Silently succeed even if user not found (security: no enumeration)
    if (!user) return;

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
        await sendPasswordResetEmail({ name: user.name, email: user.email, token: resetToken });
    } catch {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        throw new AppError('Failed to send password reset email. Please try again.', 500);
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// 7. RESET PASSWORD
// ══════════════════════════════════════════════════════════════════════════════

export const resetPassword = async (rawToken, newPassword, res) => {
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) throw new AppError('Password reset token is invalid or has expired.', 400);

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send confirmation email
    await sendPasswordChangedEmail({ name: user.name, email: user.email });

    // Auto-login with fresh tokens
    const { accessToken, refreshToken } = sendTokens(res, user);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { user: user.toSafeObject(), accessToken };
};

// ══════════════════════════════════════════════════════════════════════════════
// 8. GET ME
// ══════════════════════════════════════════════════════════════════════════════

export const getMe = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found.', 404);
    return user.toSafeObject();
};

// ══════════════════════════════════════════════════════════════════════════════
// 9. CHANGE PASSWORD  (authenticated user)
// ══════════════════════════════════════════════════════════════════════════════

export const changePassword = async (userId, { currentPassword, newPassword }, res) => {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new AppError('User not found.', 404);

    if (!(await user.comparePassword(currentPassword))) {
        throw new AppError('Current password is incorrect.', 401);
    }

    user.password = newPassword;
    await user.save();

    // Send confirmation & re-issue tokens
    await sendPasswordChangedEmail({ name: user.name, email: user.email });

    const { accessToken, refreshToken } = sendTokens(res, user);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken };
};

// ══════════════════════════════════════════════════════════════════════════════
// 10. RESEND VERIFICATION EMAIL
// ══════════════════════════════════════════════════════════════════════════════

export const resendVerificationEmail = async (userId) => {
    const user = await User.findById(userId).select('+emailVerificationToken +emailVerificationExpires');
    if (!user) throw new AppError('User not found.', 404);
    if (user.isEmailVerified) throw new AppError('This email is already verified.', 400);

    const verifyToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    try {
        await sendVerificationEmail({ name: user.name, email: user.email, token: verifyToken });
    } catch {
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save({ validateBeforeSave: false });
        throw new AppError('Failed to send verification email. Please try again.', 500);
    }
};
