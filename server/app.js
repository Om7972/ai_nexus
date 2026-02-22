/**
 * app.js  –  Express application factory.
 *
 * Security middleware is applied via applySecurityMiddleware() which handles:
 *   Helmet · CORS · Rate limiting · Body parsing
 *   MongoSanitize · XSS-clean · CSRF protection
 *
 * Routes are mounted after security middleware.
 * The global error handler is always last.
 */

import express from 'express';

import { applySecurityMiddleware, generateCsrfToken } from './config/security.js';
import requestLogger from './middlewares/requestLogger.js';
import errorHandler from './middlewares/errorHandler.js';
import AppError from './utils/AppError.js';

// ── Route imports ─────────────────────────────────────────────────────────────
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import aiModelRoutes from './routes/aiModelRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';

// ── App initialization ────────────────────────────────────────────────────────
const app = express();

// Trust first proxy (required for rate-limit IP detection behind nginx/load-balancers)
app.set('trust proxy', 1);

// ─────────────────────────────────────────────────────────────────────────────
// 1. SECURITY  (Helmet · CORS · Rate-limit · Body-parse · Sanitize · XSS · CSRF)
// ─────────────────────────────────────────────────────────────────────────────
applySecurityMiddleware(app);

// ─────────────────────────────────────────────────────────────────────────────
// 2. REQUEST LOGGER
// ─────────────────────────────────────────────────────────────────────────────
app.use(requestLogger);

// ─────────────────────────────────────────────────────────────────────────────
// 3. ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// ── Health-check – no auth required ──────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: '✅ AI-Nexus API is healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
});

// ── CSRF token endpoint ───────────────────────────────────────────────────────
// Browser clients MUST call this before any mutating request.
// Returns the token in the response body AND sets the __Host-csrf cookie.
// REST clients using Bearer tokens don't need this endpoint.
app.get('/api/v1/auth/csrf-token', (req, res) => {
    const token = generateCsrfToken(req, res);
    res.json({ success: true, csrfToken: token });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/models', aiModelRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// 4. 404 HANDLER  (catch-all – must be after all routes)
// ─────────────────────────────────────────────────────────────────────────────
app.all('*', (req, _res, next) => {
    next(new AppError(`Route ${req.method} ${req.originalUrl} not found.`, 404));
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. GLOBAL ERROR HANDLER  (must be last – 4-argument signature)
// ─────────────────────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
