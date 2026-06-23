/**
 * server.js – Entry point.
 *
 * Responsibilities:
 *  1. Load environment variables (dotenv).
 *  2. Connect to MongoDB.
 *  3. Start the HTTP server with Socket.IO support.
 *  4. Handle uncaught exceptions & unhandled promise rejections.
 */

// ── Load env FIRST before any other imports ───────────────────────────────────
import 'dotenv/config';

// ── Validate ALL env vars before anything else runs ───────────────────────────
// Hard-exits with a descriptive error if any required variable is missing.
import validateEnv from './config/env.js';
validateEnv();

import { createServer } from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import config from './config/config.js';
import logger from './utils/logger.js';
import socketService from './services/socketService.js';
import { initializeCronJobs } from './services/cronJobs.js';


// ── Handle synchronous uncaught exceptions ────────────────────────────────────
process.on('uncaughtException', (err) => {
    logger.error(`💥 UNCAUGHT EXCEPTION: ${err.message}`);
    logger.error(err.stack);
    process.exit(1);
});

// ── Connect to MongoDB then start the server ──────────────────────────────────
(async () => {
    await connectDB();

    // Create HTTP server and initialize Socket.IO
    const httpServer = createServer(app);
    socketService.initialize(httpServer);
    initializeCronJobs();

    const server = httpServer.listen(config.port, () => {
        logger.info(`🚀 Server running in ${config.env} mode on port ${config.port}`);
        logger.info(`📡 API: http://localhost:${config.port}/api/v1`);
        logger.info(`🔌 Socket.IO initialized for real-time collaboration`);
    });

    // ── Handle unhandled promise rejections ───────────────────────────────────
    process.on('unhandledRejection', (reason) => {
        logger.error(`💥 UNHANDLED REJECTION: ${reason}`);
        // Give the server time to finish pending requests before shutting down
        server.close(() => {
            logger.error('🛑 Server closed due to unhandled rejection. Exiting.');
            process.exit(1);
        });
    });

    // ── Graceful SIGTERM shutdown (e.g. from Heroku / Docker) ─────────────────
    process.on('SIGTERM', () => {
        logger.info('🛑 SIGTERM received. Closing HTTP server gracefully …');
        server.close(() => {
            logger.info('✅ HTTP server closed.');
        });
    });
})();
