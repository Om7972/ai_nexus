import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';

import config from './config/config.js';
import requestLogger from './middlewares/requestLogger.js';
import errorHandler from './middlewares/errorHandler.js';
import AppError from './utils/AppError.js';

// ── Route imports ─────────────────────────────────────────────────────────────
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

// ── App initialization ────────────────────────────────────────────────────────
const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// 1. SECURITY HEADERS  (Helmet)
// ─────────────────────────────────────────────────────────────────────────────
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: config.env === 'production', // enabled only in prod
    })
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. CORS
// ─────────────────────────────────────────────────────────────────────────────
app.use(
    cors({
        origin: config.cors.origin,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true, // allows cookies / auth headers from the browser
    })
);

// Pre-flight requests
app.options('*', cors());

// ─────────────────────────────────────────────────────────────────────────────
// 3. RATE LIMITER
// ─────────────────────────────────────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs, // default: 15 min
    max: config.rateLimit.max,           // default: 100 req / window
    standardHeaders: true,               // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again later.',
    },
});

app.use('/api', limiter);

// Stricter limit on auth endpoints to protect against brute-force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 10,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again in 15 minutes.',
    },
});

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// ─────────────────────────────────────────────────────────────────────────────
// 4. BODY PARSING
// ─────────────────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));           // reject huge payloads
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ─────────────────────────────────────────────────────────────────────────────
// 5. DATA SANITIZATION  (NoSQL injection guard)
// ─────────────────────────────────────────────────────────────────────────────
app.use(mongoSanitize());

// ─────────────────────────────────────────────────────────────────────────────
// 6. REQUEST LOGGER
// ─────────────────────────────────────────────────────────────────────────────
app.use(requestLogger);

// ─────────────────────────────────────────────────────────────────────────────
// 7. ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Health-check – no auth required
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: '✅ AI-Nexus API is healthy',
        timestamp: new Date().toISOString(),
        environment: config.env,
    });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// 8. 404 HANDLER  (must be after all routes)
// ─────────────────────────────────────────────────────────────────────────────
app.all('*', (req, res, next) => {
    next(new AppError(`Route ${req.method} ${req.originalUrl} not found.`, 404));
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. GLOBAL ERROR HANDLER  (must be last)
// ─────────────────────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
