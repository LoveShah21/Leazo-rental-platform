const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const mongoURI = process.env.NODE_ENV === 'test'
            ? process.env.MONGODB_TEST_URI
            : process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error('MongoDB URI not provided');
        }

        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: false
        };

        await mongoose.connect(mongoURI, options);

        logger.info(`📦 MongoDB connected: ${mongoose.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (error) => {
            logger.error('MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB reconnected');
        });

    } catch (error) {
        logger.error('MongoDB connection failed:', {
            message: error.message,
            code: error.code,
            name: error.name
        });

        // Log more specific error details
        if (error.name === 'MongoNetworkError') {
            logger.error('Network error - check internet connection and MongoDB Atlas whitelist');
        } else if (error.name === 'MongoServerSelectionError') {
            logger.error('Server selection error - MongoDB server may be unreachable');
        } else if (error.name === 'MongoAuthenticationError') {
            logger.error('Authentication error - check username and password');
        }

        throw error;
    }
};

const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
    } catch (error) {
        logger.error('Error closing MongoDB connection:', error);
        throw error;
    }
};

module.exports = {
    connectDB,
    disconnectDB
};