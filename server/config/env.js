/**
 * env.js  –  Environment variable validation
 *
 * Uses Zod to validate all required env vars at startup.
 * The server will REFUSE to start if any required variable is
 * missing or malformed – preventing silent misconfigurations.
 *
 * Import this FIRST in server.js (after dotenv).
 */

import { z } from 'zod';

// ── Schema ────────────────────────────────────────────────────────────────────
const envSchema = z.object({
    // Server
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(5000),

    // MongoDB
    MONGO_URI: z.string().url('MONGO_URI must be a valid MongoDB connection string'),

    // JWT – must be at least 32 chars in production
    JWT_SECRET: z.string().min(
        process.env.NODE_ENV === 'production' ? 32 : 8,
        'JWT_SECRET is too short'
    ),
    JWT_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_SECRET: z.string().min(
        process.env.NODE_ENV === 'production' ? 32 : 8,
        'JWT_REFRESH_SECRET is too short'
    ),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    // CORS (allow comma-separated URLs)
    CLIENT_ORIGIN: z.string().refine((val) => {
        return val.split(',').every((v) => {
            try {
                new URL(v.trim());
                return true;
            } catch {
                return false;
            }
        });
    }, 'CLIENT_ORIGIN must be a valid URL or comma-separated valid URLs').default('http://localhost:5173'),

    // Rate limiting
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

    // CSRF
    CSRF_SECRET: z.string().min(
        process.env.NODE_ENV === 'production' ? 32 : 8,
        'CSRF_SECRET is too short'
    ).default('csrf_dev_secret_change_in_prod_32chars!!'),

    // Email (optional in development)
    SMTP_HOST: z.string().default('smtp.ethereal.email'),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_USER: z.string().default(''),
    SMTP_PASS: z.string().default(''),
    EMAIL_FROM: z.string().default('AI-Nexus <noreply@ainexus.dev>'),

    // Session cookie (used for CSRF)
    COOKIE_SECRET: z.string().min(
        process.env.NODE_ENV === 'production' ? 32 : 8,
        'COOKIE_SECRET is too short'
    ).default('cookie_dev_secret_change_in_prod!!'),
});

// ── Parse & validate ──────────────────────────────────────────────────────────
let _env;

export function validateEnv() {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        const missing = result.error.errors.map(
            (e) => `  ✗  ${e.path.join('.')}  →  ${e.message}`
        );
        console.error('\n🚨  Environment validation FAILED:\n');
        console.error(missing.join('\n'));
        console.error('\nFix the above variables in your .env file and restart.\n');
        process.exit(1); // Hard fail – never boot with bad config
    }

    _env = result.data;
    return _env;
}

/**
 * Returns the validated env object.
 * Call validateEnv() once at startup, then use env() anywhere.
 */
export const env = () => {
    if (!_env) throw new Error('env() called before validateEnv(). Import order issue.');
    return _env;
};

export default validateEnv;
