import redisService from '../services/redisService.js';
import logger from '../utils/logger.js';

/**
 * Cache middleware using Redis
 * @param {number} duration - Cache duration in seconds (default: 5 minutes)
 * @param {function} keyGenerator - Optional custom key generator function
 */
export const cacheMiddleware = (duration = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip if Redis is not connected
    if (!redisService.isConnected) {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = keyGenerator
        ? keyGenerator(req)
        : `cache:${req.originalUrl || req.url}:user:${req.user?._id || 'guest'}`;

      // Try to get cached response
      const cachedData = await redisService.get(cacheKey);

      if (cachedData) {
        logger.debug(`Cache HIT for key: ${cacheKey}`);
        return res.status(200).json({
          ...cachedData,
          cached: true,
          cacheKey,
        });
      }

      logger.debug(`Cache MISS for key: ${cacheKey}`);

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache the response
      res.json = function (data) {
        // Only cache successful responses
        if (res.statusCode === 200) {
          redisService.set(cacheKey, data, duration).catch(err => {
            logger.error(`Failed to cache data for key ${cacheKey}:`, err);
          });
        }

        // Call original json method
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      // Don't block the request if caching fails
      next();
    }
  };
};

/**
 * Invalidate cache for specific patterns
 */
export const invalidateCache = async (pattern) => {
  try {
    await redisService.delPattern(pattern);
    logger.info(`Cache invalidated for pattern: ${pattern}`);
  } catch (error) {
    logger.error(`Failed to invalidate cache for pattern ${pattern}:`, error);
  }
};

/**
 * Middleware to invalidate cache after mutations
 */
export const invalidateCacheMiddleware = (patterns) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to invalidate cache after successful mutations
    res.json = async function (data) {
      // Only invalidate on successful mutations
      if (res.statusCode >= 200 && res.statusCode < 300 && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        for (const pattern of patterns) {
          const cachePattern = typeof pattern === 'function' ? pattern(req) : pattern;
          await invalidateCache(cachePattern);
        }
      }

      // Call original json method
      return originalJson(data);
    };

    next();
  };
};

export default cacheMiddleware;
