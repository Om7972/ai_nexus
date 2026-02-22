/**
 * config.js  –  Central configuration object.
 *
 * Reads directly from process.env (populated by dotenv before this module loads).
 * Validation of these values happens separately in config/env.js via validateEnv(),
 * which is called at the very start of server.js before any other imports run.
 *
 * WHY no Proxy / no dependency on env.js here:
 *   ESM static imports are evaluated synchronously in dependency order.
 *   If config.js imported env.js and called env(), it would execute BEFORE
 *   validateEnv() has been called in server.js, causing a "called before
 *   validateEnv()" crash. Reading process.env directly avoids that entirely.
 */

const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5000,

    mongo: {
        uri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_nexus',
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'changeme_access_secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'changeme_refresh_secret',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },

    cors: {
        // Supports comma-separated list: "http://localhost:5173,https://app.ainexus.dev"
        origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    },

    clientUrl: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    },

    email: {
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        from: process.env.EMAIL_FROM || 'AI-Nexus <noreply@ainexus.dev>',
    },

    csrf: {
        secret: process.env.CSRF_SECRET || 'csrf_dev_secret_change_in_prod_32chars!!',
    },

    cookies: {
        secret: process.env.COOKIE_SECRET || 'cookie_dev_secret_change_in_prod!!',
    },
};

export default config;
