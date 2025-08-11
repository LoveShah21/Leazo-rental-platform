const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('./errorHandler');
const User = require('../models/User');
const logger = require('../utils/logger');
const { cache } = require('../config/redis');

// Authenticate JWT token
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('Access token required');
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            throw new UnauthorizedError('Access token required');
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        // Check if token is blacklisted (for logout functionality)
        const isBlacklisted = await cache.exists(`blacklist:${token}`);
        if (isBlacklisted) {
            throw new UnauthorizedError('Token has been revoked');
        }

        // Try to get user from cache first
        let user = await cache.get(`user:${decoded.userId}`);

        if (!user) {
            // If not in cache, get from database
            user = await User.findById(decoded.userId).select('-password');

            if (!user) {
                throw new UnauthorizedError('User not found');
            }

            // Cache user for 15 minutes
            await cache.set(`user:${decoded.userId}`, user, 900);
        }

        // Check if user is active
        if (!user.isActive) {
            throw new UnauthorizedError('Account is deactivated');
        }

        // Attach user to request
        req.user = user;
        req.token = token;

        logger.debug(`User authenticated: ${user.email} (${user.role})`);
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            next(new UnauthorizedError('Invalid token'));
        } else if (error.name === 'TokenExpiredError') {
            next(new UnauthorizedError('Token expired'));
        } else {
            next(error);
        }
    }
};

// Optional authentication (doesn't throw error if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        // Check if token is blacklisted
        const isBlacklisted = await cache.exists(`blacklist:${token}`);
        if (isBlacklisted) {
            return next();
        }

        // Try to get user from cache first
        let user = await cache.get(`user:${decoded.userId}`);

        if (!user) {
            user = await User.findById(decoded.userId).select('-password');
            if (user && user.isActive) {
                await cache.set(`user:${decoded.userId}`, user, 900);
            }
        }

        if (user && user.isActive) {
            req.user = user;
            req.token = token;
        }

        next();

    } catch (error) {
        // Silently continue without authentication
        next();
    }
};

// Role-based authorization
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new UnauthorizedError('Authentication required'));
        }

        if (!roles.includes(req.user.role)) {
            logger.warn({
                userId: req.user.id,
                userRole: req.user.role,
                requiredRoles: roles,
                url: req.url,
                method: req.method
            }, 'Access denied - insufficient permissions');

            return next(new ForbiddenError('Insufficient permissions'));
        }

        next();
    };
};

// Admin authorization
const requireAdmin = authorize('admin', 'super_admin');

// Manager authorization (admin or manager)
const requireManager = authorize('admin', 'super_admin', 'manager');

// Staff authorization (admin, manager, or staff)
const requireStaff = authorize('admin', 'super_admin', 'manager', 'staff');

// Check if user owns resource or has admin privileges
const requireOwnershipOrAdmin = (getResourceUserId) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return next(new UnauthorizedError('Authentication required'));
            }

            // Admin can access any resource
            if (['admin', 'super_admin'].includes(req.user.role)) {
                return next();
            }

            // Get the user ID associated with the resource
            const resourceUserId = await getResourceUserId(req);

            if (!resourceUserId) {
                return next(new ForbiddenError('Resource not found or access denied'));
            }

            // Check if user owns the resource
            if (req.user.id.toString() !== resourceUserId.toString()) {
                logger.warn({
                    userId: req.user.id,
                    resourceUserId,
                    url: req.url,
                    method: req.method
                }, 'Access denied - not resource owner');

                return next(new ForbiddenError('Access denied'));
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Rate limiting per user
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return next();
            }

            const key = `rate_limit:${req.user.id}`;
            const current = await cache.get(key) || 0;

            if (current >= maxRequests) {
                logger.warn({
                    userId: req.user.id,
                    requests: current,
                    limit: maxRequests,
                    url: req.url
                }, 'User rate limit exceeded');

                return next(new TooManyRequestsError('Rate limit exceeded'));
            }

            // Increment counter
            await cache.set(key, current + 1, Math.ceil(windowMs / 1000));

            next();
        } catch (error) {
            // Don't block request if rate limiting fails
            logger.error('Rate limiting error:', error);
            next();
        }
    };
};

// Validate API key for webhook endpoints
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    if (!apiKey) {
        return next(new UnauthorizedError('API key required'));
    }

    // In production, you'd validate against stored API keys
    const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];

    if (!validApiKeys.includes(apiKey)) {
        logger.warn({
            apiKey: apiKey.substring(0, 8) + '...',
            ip: req.ip,
            url: req.url
        }, 'Invalid API key used');

        return next(new UnauthorizedError('Invalid API key'));
    }

    next();
};

module.exports = {
    authenticate,
    optionalAuth,
    authorize,
    requireAdmin,
    requireManager,
    requireStaff,
    requireOwnershipOrAdmin,
    userRateLimit,
    validateApiKey
};