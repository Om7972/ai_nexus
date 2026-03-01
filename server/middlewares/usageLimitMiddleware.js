import User from '../models/User.js';
import AppError from '../utils/AppError.js';

/**
 * Middleware to check and enforce daily usage limits based on user role and plan.
 * Also automatically handles daily resets of the usage counter.
 */
export const checkUsageLimit = async (req, res, next) => {
    try {
        // req.user is populated by the protect middleware
        const user = await User.findById(req.user._id || req.user.id);

        if (!user) {
            return next(new AppError('User account not found.', 404));
        }

        // 1. Daily Reset Logic
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // If the last request was before today, reset the daily counter
        if (!user.usage.lastRequestAt || user.usage.lastRequestAt < startOfToday) {
            user.usage.aiRequestsToday = 0;
        }

        // 2. Determine Role/Plan Limits
        let dailyLimit = 10; // Default Free limit

        if (user.role === 'admin' || user.plan === 'enterprise') {
            dailyLimit = Infinity;
        } else if (user.plan === 'pro') {
            dailyLimit = 500;
        }

        // 3. Enforce Limit
        if (user.usage.aiRequestsToday >= dailyLimit) {
            return next(
                new AppError(
                    `You have reached your daily AI limit of ${dailyLimit} requests. Please upgrade your plan for more.`,
                    429
                )
            );
        }

        // 4. Increment and Save usage metrics
        user.usage.aiRequestsToday += 1;
        user.usage.aiRequestsTotal += 1;
        user.usage.lastRequestAt = now;

        await user.save({ validateBeforeSave: false });

        next();
    } catch (error) {
        next(error);
    }
};
