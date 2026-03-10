const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // 10 mins default TTL

/**
 * Cache middleware
 * @param {number} duration - Cache duration in seconds
 */
const cacheMiddleware = (duration) => {
    return (req, res, next) => {
        // Skip caching for non-GET requests
        if (req.method !== "GET") {
            return next();
        }

        const key = req.originalUrl || req.url;
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            return res.status(200).json(cachedResponse);
        } else {
            // Override res.json to store the response in cache
            res.originalJson = res.json;
            res.json = (body) => {
                cache.set(key, body, duration);
                res.originalJson(body);
            };
            next();
        }
    };
};

/**
 * Clear cache by pattern or key
 * @param {string} key 
 */
const clearCache = (key) => {
    if (key) {
        cache.del(key);
    } else {
        cache.flushAll();
    }
};

module.exports = { cacheMiddleware, clearCache, cache };
