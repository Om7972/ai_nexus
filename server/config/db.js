import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const MAX_RETRY = 5;
let retryCount = 0;

/**
 * Connect to MongoDB with automatic retry and graceful shutdown hooks.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Mongoose 7+ ignores these but kept for documentation clarity
            serverSelectionTimeoutMS: 5000,
        });

        retryCount = 0; // reset on success
        logger.info(`✅ MongoDB connected → ${conn.connection.host}`);
    } catch (err) {
        retryCount += 1;
        logger.error(`❌ MongoDB connection failed (attempt ${retryCount}): ${err.message}`);

        if (retryCount < MAX_RETRY) {
            const delay = retryCount * 2000; // exponential-ish back-off
            logger.info(`🔄  Retrying in ${delay / 1000}s …`);
            setTimeout(connectDB, delay);
        } else {
            logger.error('💀 Max retry attempts reached. Exiting process.');
            process.exit(1);
        }
    }
};

// ── Mongoose global event listeners ────────────────────────────────────────
mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️  MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
    logger.info('🔁 MongoDB reconnected.');
});

// ── Graceful shutdown ────────────────────────────────────────────────────────
const gracefulShutdown = async (signal) => {
    logger.info(`\n🛑 ${signal} received – closing MongoDB connection …`);
    await mongoose.connection.close();
    logger.info('✅ MongoDB connection closed. Exiting.');
    process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default connectDB;
