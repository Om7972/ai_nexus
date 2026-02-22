/**
 * logger.js  –  Winston production-grade logger
 *
 * Replaces the lightweight console-based logger.
 * Keeps the same interface (logger.info / warn / error / http / debug)
 * so no other file needs updating.
 *
 * Transport strategy:
 *   development  →  colorized console only
 *   production   →  JSON console  +  rotating daily log files
 *                   logs/error.log   (error level only)
 *                   logs/combined.log (all levels)
 */

import { createLogger, format, transports } from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, '..', 'logs');

// Ensure logs/ directory exists
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const isDev = (process.env.NODE_ENV || 'development') !== 'production';

// ── Custom formats ────────────────────────────────────────────────────────────

/** Colourised, human-readable line for development */
const devFormat = format.combine(
    format.timestamp({ format: 'HH:mm:ss' }),
    format.colorize({ all: true }),
    format.printf(({ timestamp, level, message, ...meta }) => {
        const extra = Object.keys(meta).length ? `  ${JSON.stringify(meta)}` : '';
        return `${timestamp} [${level}] ${message}${extra}`;
    })
);

/** Structured JSON for production ingestion (Datadog, CloudWatch, etc.) */
const prodFormat = format.combine(
    format.timestamp(),
    format.errors({ stack: true }),   // include stack traces in the JSON
    format.json()
);

// ── Transport list ────────────────────────────────────────────────────────────

const productionTransports = [
    // Stdout (captured by container orchestrators / PM2)
    new transports.Console({
        format: prodFormat,
        handleExceptions: true,
    }),

    // Persistent error log
    new transports.File({
        filename: path.join(LOG_DIR, 'error.log'),
        level: 'error',
        format: prodFormat,
        maxsize: 10 * 1024 * 1024,  // 10 MB per file
        maxFiles: 14,               // keep 14 rolling files (~140 MB total)
        tailable: true,
    }),

    // Combined log (all levels)
    new transports.File({
        filename: path.join(LOG_DIR, 'combined.log'),
        format: prodFormat,
        maxsize: 20 * 1024 * 1024,
        maxFiles: 7,
        tailable: true,
    }),
];

const developmentTransports = [
    new transports.Console({
        format: devFormat,
        handleExceptions: true,
    }),
];

// ── Create logger instance ────────────────────────────────────────────────────

const logger = createLogger({
    // Minimum level to log.
    // Production: 'info' (http + debug are silenced)
    // Development: 'http' (all levels including http requests)
    level: isDev ? 'http' : 'info',

    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4,
    },

    transports: isDev ? developmentTransports : productionTransports,

    // Catch unhandled exceptions / promise rejections and log before crash
    exceptionHandlers: [
        new transports.File({ filename: path.join(LOG_DIR, 'exceptions.log') }),
    ],
    rejectionHandlers: [
        new transports.File({ filename: path.join(LOG_DIR, 'rejections.log') }),
    ],

    // Don't exit on handled exceptions
    exitOnError: false,
});

// ── Add colours for Winston's colorize() ─────────────────────────────────────
import { addColors } from 'winston';
addColors({
    error: 'bold red',
    warn: 'bold yellow',
    info: 'bold green',
    http: 'bold cyan',
    debug: 'bold magenta',
});

export default logger;
