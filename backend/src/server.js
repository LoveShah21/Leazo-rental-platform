require('dotenv').config();
require('express-async-errors');

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

const logger = require('./utils/logger');
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { initializeSocketIO } = require('./config/socket');
const { verifyCloudinaryConfig } = require('./config/cloudinary');
const { setupRecurringJobs } = require('./config/queue');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const availabilityRoutes = require('./routes/availability');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const shippingRoutes = require('./routes/shipping');
const reportRoutes = require('./routes/reports');
const webhookRoutes = require('./routes/webhooks');
const adminRoutes = require('./routes/admin');
const providerRoutes = require('./routes/provider');

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));

// Rate limiting
const isGlobalRateLimitDisabled = process.env.DISABLE_GLOBAL_RATE_LIMIT === 'true'
  || process.env.DISABLE_RATE_LIMITING === 'true'
  || process.env.NODE_ENV === 'development';

const limiter = isGlobalRateLimitDisabled
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });

app.use(limiter);
app.use(compression());
app.use(requestLogger);

// Body parsing middleware
// Raw body for webhooks BEFORE JSON parsing
app.use('/api/webhooks/cashfree', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoints
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

app.get('/ready', async (req, res) => {
    try {
        // Check database connection
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database not connected');
        }

        // Check Redis connection
        const { getRedisClient } = require('./config/redis');
        const redis = getRedisClient();
        await redis.ping();

        res.status(200).json({
            status: 'Ready',
            timestamp: new Date().toISOString(),
            services: {
                database: 'connected',
                redis: 'connected'
            }
        });
    } catch (error) {
        logger.error('Readiness check failed:', error);
        res.status(503).json({
            status: 'Not Ready',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/webhooks', webhookRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize services
async function startServer() {
    try {
        // Connect to databases
        await connectDB();

        // Try to connect to Redis (optional for development)
        try {
            await connectRedis();
            logger.info('✅ Redis connected successfully');
        } catch (redisError) {
            logger.warn('⚠️ Redis connection failed - running without Redis/Queue functionality:', redisError.message);
        }

        // Verify Cloudinary configuration (optional)
        try {
            await verifyCloudinaryConfig();
            logger.info('✅ Cloudinary configuration verified');
        } catch (cloudinaryError) {
            logger.warn('⚠️ Cloudinary configuration failed - file uploads may not work:', cloudinaryError.message);
        }

        // Start server
        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
        });

        // Initialize Socket.IO
        initializeSocketIO(io);

        // Schedule background jobs
        await setupRecurringJobs();

    } catch (error) {
        logger.error('Server startup error:', error);
        process.exit(1);
    }
}

startServer();

module.exports = { app, server, io };