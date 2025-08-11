const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { getRedisPublisher, getRedisSubscriber } = require('./redis');

let io = null;

const initializeSocketIO = (socketIO) => {
    io = socketIO;

    // Authentication middleware for Socket.IO
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

            if (!token) {
                return next(new Error('Authentication token required'));
            }

            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            socket.userId = decoded.userId;
            socket.userRole = decoded.role;

            logger.info(`Socket authenticated for user: ${decoded.userId}`);
            next();
        } catch (error) {
            logger.error('Socket authentication failed:', error);
            next(new Error('Authentication failed'));
        }
    });

    // Connection handling
    io.on('connection', (socket) => {
        logger.info(`Socket connected: ${socket.id} for user: ${socket.userId}`);

        // Join user-specific room
        socket.join(`user:${socket.userId}`);

        // Handle joining product rooms for inventory updates
        socket.on('join:product', (productId) => {
            socket.join(`product:${productId}`);
            logger.debug(`Socket ${socket.id} joined product room: ${productId}`);
        });

        // Handle joining location rooms for inventory updates
        socket.on('join:location', (locationId) => {
            socket.join(`location:${locationId}`);
            logger.debug(`Socket ${socket.id} joined location room: ${locationId}`);
        });

        // Handle joining booking rooms for status updates
        socket.on('join:booking', (bookingId) => {
            socket.join(`booking:${bookingId}`);
            logger.debug(`Socket ${socket.id} joined booking room: ${bookingId}`);
        });

        // Handle leaving rooms
        socket.on('leave:product', (productId) => {
            socket.leave(`product:${productId}`);
            logger.debug(`Socket ${socket.id} left product room: ${productId}`);
        });

        socket.on('leave:location', (locationId) => {
            socket.leave(`location:${locationId}`);
            logger.debug(`Socket ${socket.id} left location room: ${locationId}`);
        });

        socket.on('leave:booking', (bookingId) => {
            socket.leave(`booking:${bookingId}`);
            logger.debug(`Socket ${socket.id} left booking room: ${bookingId}`);
        });

        // Handle disconnection
        socket.on('disconnect', (reason) => {
            logger.info(`Socket disconnected: ${socket.id}, reason: ${reason}`);
        });

        // Handle errors
        socket.on('error', (error) => {
            logger.error(`Socket error for ${socket.id}:`, error);
        });
    });

    // Set up Redis pub/sub for multi-instance support
    setupRedisPubSub();

    logger.info('🔌 Socket.IO initialized');
};

const setupRedisPubSub = async () => {
    try {
        const subscriber = getRedisSubscriber();
        const publisher = getRedisPublisher();

        // Subscribe to channels
        await subscriber.subscribe('inventory:update', (message) => {
            const data = JSON.parse(message);
            emitToRoom(`product:${data.productId}`, 'inventory:update', data);
            emitToRoom(`location:${data.locationId}`, 'inventory:update', data);
        });

        await subscriber.subscribe('hold:created', (message) => {
            const data = JSON.parse(message);
            emitToRoom(`product:${data.productId}`, 'hold:created', data);
        });

        await subscriber.subscribe('hold:released', (message) => {
            const data = JSON.parse(message);
            emitToRoom(`product:${data.productId}`, 'hold:released', data);
        });

        await subscriber.subscribe('booking:statusChanged', (message) => {
            const data = JSON.parse(message);
            emitToRoom(`booking:${data.bookingId}`, 'booking:statusChanged', data);
            emitToUser(data.userId, 'booking:statusChanged', data);
        });

        await subscriber.subscribe('price:update', (message) => {
            const data = JSON.parse(message);
            emitToRoom(`product:${data.productId}`, 'price:update', data);
        });

        logger.info('🔴 Redis pub/sub for Socket.IO initialized');
    } catch (error) {
        logger.error('Failed to setup Redis pub/sub:', error);
    }
};

// Utility functions for emitting events
const emitToRoom = (room, event, data) => {
    if (io) {
        io.to(room).emit(event, data);
        logger.debug(`Emitted ${event} to room ${room}`);
    }
};

const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
        logger.debug(`Emitted ${event} to user ${userId}`);
    }
};

const emitToAll = (event, data) => {
    if (io) {
        io.emit(event, data);
        logger.debug(`Emitted ${event} to all connected clients`);
    }
};

// Redis publish functions for multi-instance coordination
const publishInventoryUpdate = async (data) => {
    try {
        const publisher = getRedisPublisher();
        await publisher.publish('inventory:update', JSON.stringify(data));
    } catch (error) {
        logger.error('Failed to publish inventory update:', error);
    }
};

const publishHoldCreated = async (data) => {
    try {
        const publisher = getRedisPublisher();
        await publisher.publish('hold:created', JSON.stringify(data));
    } catch (error) {
        logger.error('Failed to publish hold created:', error);
    }
};

const publishHoldReleased = async (data) => {
    try {
        const publisher = getRedisPublisher();
        await publisher.publish('hold:released', JSON.stringify(data));
    } catch (error) {
        logger.error('Failed to publish hold released:', error);
    }
};

const publishBookingStatusChanged = async (data) => {
    try {
        const publisher = getRedisPublisher();
        await publisher.publish('booking:statusChanged', JSON.stringify(data));
    } catch (error) {
        logger.error('Failed to publish booking status changed:', error);
    }
};

const publishPriceUpdate = async (data) => {
    try {
        const publisher = getRedisPublisher();
        await publisher.publish('price:update', JSON.stringify(data));
    } catch (error) {
        logger.error('Failed to publish price update:', error);
    }
};

module.exports = {
    initializeSocketIO,
    emitToRoom,
    emitToUser,
    emitToAll,
    publishInventoryUpdate,
    publishHoldCreated,
    publishHoldReleased,
    publishBookingStatusChanged,
    publishPriceUpdate
};