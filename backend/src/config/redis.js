const { createClient } = require('redis');
const logger = require('../utils/logger');

let redisClient = null;
let redisSubscriber = null;
let redisPublisher = null;

const connectRedis = async () => {
    try {
        const redisConfig = {
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            socket: {
                reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
            }
        };

        if (process.env.REDIS_PASSWORD) {
            redisConfig.password = process.env.REDIS_PASSWORD;
        }

        // Main Redis client
        redisClient = createClient(redisConfig);

        redisClient.on('error', (error) => {
            logger.error('Redis client error:', error);
        });

        redisClient.on('connect', () => {
            logger.info('🔴 Redis client connected');
        });

        redisClient.on('ready', () => {
            logger.info('🔴 Redis client ready');
        });

        redisClient.on('end', () => {
            logger.warn('Redis client connection ended');
        });

        await redisClient.connect();

        // Subscriber client for pub/sub
        redisSubscriber = redisClient.duplicate();
        await redisSubscriber.connect();

        // Publisher client for pub/sub
        redisPublisher = redisClient.duplicate();
        await redisPublisher.connect();

        logger.info('🔴 Redis connections established');

    } catch (error) {
        logger.error('Redis connection failed:', error);
        throw error;
    }
};

const closeRedis = async () => {
    try {
        if (redisClient) {
            await redisClient.quit();
        }
        if (redisSubscriber) {
            await redisSubscriber.quit();
        }
        if (redisPublisher) {
            await redisPublisher.quit();
        }
        logger.info('Redis connections closed');
    } catch (error) {
        logger.error('Error closing Redis connections:', error);
        throw error;
    }
};

const getRedisClient = () => {
    if (!redisClient) {
        throw new Error('Redis client not initialized');
    }
    return redisClient;
};

const getRedisSubscriber = () => {
    if (!redisSubscriber) {
        throw new Error('Redis subscriber not initialized');
    }
    return redisSubscriber;
};

const getRedisPublisher = () => {
    if (!redisPublisher) {
        throw new Error('Redis publisher not initialized');
    }
    return redisPublisher;
};

// Cache utilities
const cache = {
    async get(key) {
        try {
            const value = await redisClient.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            logger.error('Cache get error:', error);
            return null;
        }
    },

    async set(key, value, ttlSeconds = 3600) {
        try {
            await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
            return true;
        } catch (error) {
            logger.error('Cache set error:', error);
            return false;
        }
    },

    async del(key) {
        try {
            await redisClient.del(key);
            return true;
        } catch (error) {
            logger.error('Cache delete error:', error);
            return false;
        }
    },

    async exists(key) {
        try {
            return await redisClient.exists(key);
        } catch (error) {
            logger.error('Cache exists error:', error);
            return false;
        }
    },

    async flush() {
        try {
            await redisClient.flushAll();
            return true;
        } catch (error) {
            logger.error('Cache flush error:', error);
            return false;
        }
    }
};

module.exports = {
    connectRedis,
    closeRedis,
    getRedisClient,
    getRedisSubscriber,
    getRedisPublisher,
    cache
};