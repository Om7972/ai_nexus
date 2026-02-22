/**
 * config.js  –  Central configuration object.
 *
 * Reads from the VALIDATED env object (via config/env.js).
 * All values here are guaranteed to be correctly typed and present.
 */
import { env } from './env.js';

const buildConfig = () => {
    const e = env();
    return {
        env: e.NODE_ENV,
        port: e.PORT,

        mongo: { uri: e.MONGO_URI },

        jwt: {
            secret: e.JWT_SECRET,
            expiresIn: e.JWT_EXPIRES_IN,
            refreshSecret: e.JWT_REFRESH_SECRET,
            refreshExpiresIn: e.JWT_REFRESH_EXPIRES_IN,
        },

        cors: { origin: e.CLIENT_ORIGIN },
        clientUrl: e.CLIENT_ORIGIN,

        rateLimit: {
            windowMs: e.RATE_LIMIT_WINDOW_MS,
            max: e.RATE_LIMIT_MAX,
        },

        email: {
            host: e.SMTP_HOST,
            port: e.SMTP_PORT,
            user: e.SMTP_USER,
            pass: e.SMTP_PASS,
            from: e.EMAIL_FROM,
        },

        csrf: { secret: e.CSRF_SECRET },
        cookies: { secret: e.COOKIE_SECRET },
    };
};

// Lazy-initialise so validateEnv() must be called before this module is used
let _config = null;
const config = new Proxy({}, {
    get(_target, prop) {
        if (!_config) _config = buildConfig();
        return _config[prop];
    },
});

export default config;
