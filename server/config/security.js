/**
 * security.js  –  Consolidated enterprise security middleware
 *
 * Exports a single `applySecurityMiddleware(app)` function that wires up:
 *   1. Helmet          – HTTP security headers
 *   2. CORS            – Cross-origin request policy
 *   3. Rate limiters   – General + per-route stricter limits
 *   4. Body parsers    – With size limits
 *   5. MongoSanitize   – NoSQL injection prevention
 *   6. XSS Clean       – HTML/script tag stripping
 *   7. CSRF            – Double-submit cookie pattern
 *   8. Cookie parser   – Required for CSRF cookie reading
 *
 * Import order matters – this must run before routes are mounted.
 */

import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xssClean from 'xss-clean';
import cookieParser from 'cookie-parser';
import express from 'express';
import { doubleCsrf } from 'csrf-csrf';

import config from './config.js';
import logger from '../utils/logger.js';

// ── 1. Helmet – HTTP Security Headers ────────────────────────────────────────

export const helmetMiddleware = helmet({
    // Content-Security-Policy: strict defaults + allow our own API origin
    contentSecurityPolicy: config.env === 'production'
        ? {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],  // needed for inline styles
                imgSrc: ["'self'", 'data:', 'blob:'],
                fontSrc: ["'self'", 'data:'],
                connectSrc: ["'self'", config.clientUrl],
                frameSrc: ["'none'"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: [],
            },
        }
        : false,  // CSP disabled in dev to avoid blocking HMR

    // Prevent MIME-type sniffing
    noSniff: true,

    // Hide X-Powered-By: Express
    hidePoweredBy: true,

    // Force HTTPS for 1 year in production
    hsts: config.env === 'production'
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,

    // Disable iframing
    frameguard: { action: 'sameorigin' },

    // XSS protection header (legacy browsers)
    xssFilter: true,

    // Referrer policy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

    // Cross-origin policies
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
});

// ── 2. CORS ───────────────────────────────────────────────────────────────────

// Allow multiple origins (comma-separated in .env)
const allowedOrigins = config.cors.origin.split(',').map((o) => o.trim());

export const corsMiddleware = cors({
    origin: (origin, callback) => {
        // Allow server-to-server requests (no Origin header) in dev
        if (!origin && config.env !== 'production') return callback(null, true);
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin "${origin}" is not allowed.`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    credentials: true,
    maxAge: 86400,  // preflight cache: 24 hours
});

// ── 3. Rate limiters ──────────────────────────────────────────────────────────

/**
 * General API limiter  –  100 req / 15 min per IP
 */
export const generalLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip,
    handler: (req, res) => {
        logger.warn(`[RateLimit] General limit hit: ${req.ip} → ${req.originalUrl}`);
        res.status(429).json({
            success: false,
            message: 'Too many requests. Please try again later.',
            retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
        });
    },
});

/**
 * Auth limiter  –  10 req / 15 min (brute-force protection)
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,  // don't count 2xx responses
    handler: (req, res) => {
        logger.warn(`[RateLimit] Auth limit hit: ${req.ip} → ${req.path}`);
        res.status(429).json({
            success: false,
            message: 'Too many login attempts. Please wait 15 minutes.',
            retryAfter: 900,
        });
    },
});

/**
 * Strict limiter  –  5 req / hour for password-reset / forgot-password
 */
export const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`[RateLimit] Strict limit hit: ${req.ip} → ${req.path}`);
        res.status(429).json({
            success: false,
            message: 'Too many requests for this operation. Please try again in 1 hour.',
            retryAfter: 3600,
        });
    },
});

// ── 4. CSRF (Double-Submit Cookie) ────────────────────────────────────────────
//
// CSRF tokens are ONLY needed for cookie-based auth (browser clients).
// REST clients using Bearer tokens in headers are inherently CSRF-safe
// because browsers cannot set custom headers cross-origin.
//
// Flow:
//   GET  /api/v1/auth/csrf-token  →  server sets __Host-csrf cookie + returns x-csrf-token
//   Browser sends x-csrf-token header on every mutating request.

const csrfSecret = process.env.CSRF_SECRET || 'csrf_dev_secret_change_in_prod_32chars!!';

export const {
    generateToken: generateCsrfToken,
    doubleCsrfProtection,
} = doubleCsrf({
    getSecret: () => csrfSecret,
    cookieName: '__Host-csrf',  // __Host- prefix = secure, path=/, no domain
    cookieOptions: {
        httpOnly: true,
        sameSite: 'strict',
        secure: config.env === 'production',
        path: '/',
    },
    size: 64,
    getTokenFromRequest: (req) =>
        req.headers['x-csrf-token'] || req.body?._csrf,
});

/**
 * Wrapper that only enforces CSRF on:
 *   - Mutating methods (POST/PUT/PATCH/DELETE)
 *   - Cookie-based sessions (no Authorization Bearer header)
 *
 * Bearer-token requests skip CSRF because they can't be triggered
 * cross-origin from a browser without explicit JS (which CSP blocks).
 */
export const csrfProtection = (req, res, next) => {
    const isBearerAuth = req.headers.authorization?.startsWith('Bearer ');
    const isSafeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);

    if (isSafeMethod || isBearerAuth) return next();

    // Apply double-submit CSRF check
    doubleCsrfProtection(req, res, next);
};

// ── 5. XSS sanitizer ─────────────────────────────────────────────────────────
// xss-clean strips <script>, on* attrs, etc. from req.body / req.params / req.query
export const xssMiddleware = xssClean();

// ── 6. Master wiring function ─────────────────────────────────────────────────

/**
 * Apply all security middleware to an Express app instance.
 * Call this BEFORE mounting any routes.
 *
 * @param {import('express').Application} app
 */
export function applySecurityMiddleware(app) {
    // Security headers
    app.use(helmetMiddleware);

    // CORS (must be before rate-limiting so OPTIONS isn't blocked)
    app.use(corsMiddleware);
    app.options('*', corsMiddleware);

    // Cookie parser (needed for CSRF cookie reading)
    app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie_dev_secret'));

    // Body parsers (size limits prevent payload flooding)
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));

    // NoSQL injection guard
    app.use(mongoSanitize({
        replaceWith: '_',
        onSanitizeKey: (key, req) => {
            logger.warn(`[MongoSanitize] Sanitized key "${key}" from ${req.ip}`);
        },
    }));

    // XSS cleaning
    app.use(xssMiddleware);

    // General API rate limiter
    app.use('/api', generalLimiter);

    // Stricter auth limits
    app.use('/api/v1/auth/login', authLimiter);
    app.use('/api/v1/auth/register', authLimiter);
    app.use('/api/v1/auth/forgot-password', strictLimiter);
    app.use('/api/v1/auth/reset-password', strictLimiter);
    app.use('/api/v1/auth/resend-verification', strictLimiter);

    logger.info('✅  Security middleware applied');
}

export default applySecurityMiddleware;
