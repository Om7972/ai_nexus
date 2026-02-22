/**
 * Central configuration object.
 * Reads from process.env (loaded by dotenv in server.js).
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
        origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    },

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

    clientUrl: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
};

export default config;
