import jwt from 'jsonwebtoken';
import config from '../config/config.js';

// ──────────────────────────────────────────────────────────────────────────────
// Token Expiry Configuration
//  • Access token  →  15 minutes  (short-lived, sent in header OR cookie)
//  • Refresh token →  7 days      (long-lived, HTTP-only cookie + stored in DB)
// ──────────────────────────────────────────────────────────────────────────────

const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// ── Sign ──────────────────────────────────────────────────────────────────────

export const signAccessToken = (payload) =>
    jwt.sign(payload, config.jwt.secret, { expiresIn: ACCESS_EXPIRES_IN });

export const signRefreshToken = (payload) =>
    jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: REFRESH_EXPIRES_IN });

// ── Verify ────────────────────────────────────────────────────────────────────

export const verifyAccessToken = (token) =>
    jwt.verify(token, config.jwt.secret);

export const verifyRefreshToken = (token) =>
    jwt.verify(token, config.jwt.refreshSecret);

// ── Cookie helpers ────────────────────────────────────────────────────────────

const isProduction = () => process.env.NODE_ENV === 'production';

/**
 * Set both access and refresh tokens as secure HTTP-only cookies and return
 * the raw access token (so it can also be sent in the JSON body for mobile clients).
 */
export const sendTokens = (res, user) => {
    const payload = { id: user._id, role: user.role };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const sharedOpts = {
        httpOnly: true,
        secure: isProduction(),
        sameSite: isProduction() ? 'strict' : 'lax',
    };

    // Access token cookie  – 15 min
    res.cookie('accessToken', accessToken, {
        ...sharedOpts,
        maxAge: 15 * 60 * 1000,
    });

    // Refresh token cookie – 7 days
    res.cookie('refreshToken', refreshToken, {
        ...sharedOpts,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/v1/auth', // limit scope to auth endpoints
    });

    return { accessToken, refreshToken };
};

/**
 * Clear both token cookies (used during logout).
 */
export const clearTokens = (res) => {
    const sharedOpts = {
        httpOnly: true,
        secure: isProduction(),
        sameSite: isProduction() ? 'strict' : 'lax',
    };

    res.clearCookie('accessToken', sharedOpts);
    res.clearCookie('refreshToken', { ...sharedOpts, path: '/api/v1/auth' });
};
