const { Queue, Worker } = require('bullmq');
const { getRedisClient } = require('./redis');
const logger = require('../utils/logger');

// Queue configurations
const queueConfig = {
    connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined
    },
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000
        }
    }
};

// Create queues
const queues = {
    email: new Queue('email', queueConfig),
    notifications: new Queue('notifications', queueConfig),
    payments: new Queue('payments', queueConfig),
    shipping: new Queue('shipping', queueConfig),
    reports: new Queue('reports', queueConfig),
    cleanup: new Queue('cleanup', queueConfig),
    analytics: new Queue('analytics', queueConfig)
};

// Note: QueueScheduler is deprecated in BullMQ v5+
// Scheduling functionality is now built into Queue class

// Job processors
const processors = {
    // Email processor
    email: async (job) => {
        const { type, data } = job.data;
        const emailService = require('../services/emailService');

        logger.info(`Processing email job: ${type}`, { jobId: job.id });

        switch (type) {
            case 'welcome':
                return await emailService.sendWelcomeEmail(data);
            case 'booking_confirmation':
                return await emailService.sendBookingConfirmation(data);
            case 'payment_receipt':
                return await emailService.sendPaymentReceipt(data);
            case 'booking_reminder':
                return await emailService.sendBookingReminder(data);
            case 'overdue_notification':
                return await emailService.sendOverdueNotification(data);
            case 'password_reset':
                return await emailService.sendPasswordReset(data);
            default:
                throw new Error(`Unknown email type: ${type}`);
        }
    },

    // Notification processor
    notifications: async (job) => {
        const { type, data } = job.data;
        const notificationService = require('../services/notificationService');

        logger.info(`Processing notification job: ${type}`, { jobId: job.id });

        switch (type) {
            case 'push_notification':
                return await notificationService.sendPushNotification(data);
            case 'sms_notification':
                return await notificationService.sendSMS(data);
            case 'in_app_notification':
                return await notificationService.createInAppNotification(data);
            default:
                throw new Error(`Unknown notification type: ${type}`);
        }
    },

    // Payment processor
    payments: async (job) => {
        const { type, data } = job.data;
        const paymentService = require('../services/paymentService');

        logger.info(`Processing payment job: ${type}`, { jobId: job.id });

        switch (type) {
            case 'process_refund':
                return await paymentService.processRefund(data);
            case 'generate_invoice':
                return await paymentService.generateInvoice(data);
            case 'payment_reminder':
                return await paymentService.sendPaymentReminder(data);
            case 'late_fee_calculation':
                return await paymentService.calculateLateFees(data);
            default:
                throw new Error(`Unknown payment job type: ${type}`);
        }
    },

    // Shipping processor (Delhivery)
    shipping: async (job) => {
        const { type, data } = job.data;
        const shippingService = require('../services/shippingService');

        logger.info(`Processing shipping job: ${type}`, { jobId: job.id });

        switch (type) {
            case 'create_shipment':
                return await shippingService.createShipment(data);
            case 'track_shipment':
                return await shippingService.trackShipment(data);
            case 'cancel_shipment':
                return await shippingService.cancelShipment(data);
            default:
                throw new Error(`Unknown shipping job type: ${type}`);
        }
    },

    // Reports processor
    reports: async (job) => {
        const { type, data } = job.data;
        const reportService = require('../services/reportService');

        logger.info(`Processing report job: ${type}`, { jobId: job.id });

        switch (type) {
            case 'generate_monthly_report':
                return await reportService.generateMonthlyReport(data);
            case 'export_bookings':
                return await reportService.exportBookings(data);
            case 'analytics_snapshot':
                return await reportService.createAnalyticsSnapshot(data);
            default:
                throw new Error(`Unknown report job type: ${type}`);
        }
    },

    // Cleanup processor
    cleanup: async (job) => {
        const { type, data } = job.data;

        logger.info(`Processing cleanup job: ${type}`, { jobId: job.id });

        switch (type) {
            case 'expired_holds':
                const Hold = require('../models/Hold');
                return await Hold.cleanupExpired();
            case 'old_logs':
                // Implement log cleanup
                return { cleaned: 0 };
            case 'temp_files':
                const { cleanupOldFiles } = require('./cloudinary');
                return await cleanupOldFiles('temp', 1); // 1 day old
            default:
                throw new Error(`Unknown cleanup job type: ${type}`);
        }
    },

    // Analytics processor
    analytics: async (job) => {
        const { type, data } = job.data;
        const analyticsService = require('../services/analyticsService');

        logger.info(`Processing analytics job: ${type}`, { jobId: job.id });

        switch (type) {
            case 'update_product_stats':
                return await analyticsService.updateProductStats(data);
            case 'calculate_kpis':
                return await analyticsService.calculateKPIs(data);
            case 'user_behavior_analysis':
                return await analyticsService.analyzeUserBehavior(data);
            default:
                throw new Error(`Unknown analytics job type: ${type}`);
        }
    }
};

// Create workers
const workers = {};
Object.keys(processors).forEach(queueName => {
    workers[queueName] = new Worker(queueName, processors[queueName], {
        ...queueConfig,
        concurrency: queueName === 'email' ? 5 : 3
    });

    // Worker event handlers
    workers[queueName].on('completed', (job) => {
        logger.info(`Job completed: ${queueName}:${job.id}`);
    });

    workers[queueName].on('failed', (job, err) => {
        logger.error(`Job failed: ${queueName}:${job.id}`, { error: err.message });
    });

    workers[queueName].on('error', (err) => {
        logger.error(`Worker error in ${queueName}:`, err);
    });
});

// Job creation helpers
const addJob = async (queueName, jobType, data, options = {}) => {
    if (!queues[queueName]) {
        throw new Error(`Queue ${queueName} not found`);
    }

    const jobData = { type: jobType, data };
    const job = await queues[queueName].add(jobType, jobData, {
        ...queueConfig.defaultJobOptions,
        ...options
    });

    logger.info(`Job added: ${queueName}:${jobType}`, { jobId: job.id });
    return job;
};

// Specific job helpers
const emailJobs = {
    sendWelcomeEmail: (userData) => addJob('email', 'welcome', userData),
    sendBookingConfirmation: (bookingData) => addJob('email', 'booking_confirmation', bookingData),
    sendPaymentReceipt: (paymentData) => addJob('email', 'payment_receipt', paymentData),
    sendBookingReminder: (bookingData, delay = 24 * 60 * 60 * 1000) =>
        addJob('email', 'booking_reminder', bookingData, { delay }),
    sendOverdueNotification: (bookingData) => addJob('email', 'overdue_notification', bookingData),
    sendPasswordReset: (userData) => addJob('email', 'password_reset', userData)
};

const notificationJobs = {
    sendPushNotification: (notificationData) => addJob('notifications', 'push_notification', notificationData),
    sendSMS: (smsData) => addJob('notifications', 'sms_notification', smsData),
    createInAppNotification: (notificationData) => addJob('notifications', 'in_app_notification', notificationData)
};

const paymentJobs = {
    processRefund: (refundData) => addJob('payments', 'process_refund', refundData),
    generateInvoice: (paymentData) => addJob('payments', 'generate_invoice', paymentData),
    sendPaymentReminder: (paymentData, delay = 24 * 60 * 60 * 1000) =>
        addJob('payments', 'payment_reminder', paymentData, { delay }),
    calculateLateFees: (bookingData) => addJob('payments', 'late_fee_calculation', bookingData)
};

const shippingJobs = {
    createShipment: (orderData) => addJob('shipping', 'create_shipment', orderData),
    trackShipment: (waybill) => addJob('shipping', 'track_shipment', waybill),
    cancelShipment: (waybill) => addJob('shipping', 'cancel_shipment', waybill)
};

const reportJobs = {
    generateMonthlyReport: (reportData) => addJob('reports', 'generate_monthly_report', reportData),
    exportBookings: (exportData) => addJob('reports', 'export_bookings', exportData),
    createAnalyticsSnapshot: (analyticsData) => addJob('reports', 'analytics_snapshot', analyticsData)
};

const cleanupJobs = {
    cleanupExpiredHolds: () => addJob('cleanup', 'expired_holds', {}),
    cleanupOldLogs: () => addJob('cleanup', 'old_logs', {}),
    cleanupTempFiles: () => addJob('cleanup', 'temp_files', {})
};

const analyticsJobs = {
    updateProductStats: (productData) => addJob('analytics', 'update_product_stats', productData),
    calculateKPIs: (kpiData) => addJob('analytics', 'calculate_kpis', kpiData),
    analyzeUserBehavior: (behaviorData) => addJob('analytics', 'user_behavior_analysis', behaviorData)
};

// Recurring jobs setup
const setupRecurringJobs = async () => {
    // Cleanup expired holds every 5 minutes
    await queues.cleanup.add('expired_holds', { type: 'expired_holds', data: {} }, {
        repeat: { pattern: '*/5 * * * *' },
        jobId: 'cleanup-expired-holds'
    });

    // Generate daily analytics at midnight
    await queues.analytics.add('daily_kpis', { type: 'calculate_kpis', data: {} }, {
        repeat: { pattern: '0 0 * * *' },
        jobId: 'daily-kpis'
    });

    // Cleanup temp files daily at 2 AM
    await queues.cleanup.add('temp_files', { type: 'temp_files', data: {} }, {
        repeat: { pattern: '0 2 * * *' },
        jobId: 'cleanup-temp-files'
    });

    logger.info('Recurring jobs set up successfully');
};

// Graceful shutdown
const closeQueues = async () => {
    logger.info('Closing job queues...');

    // Close workers
    await Promise.all(Object.values(workers).map(worker => worker.close()));

    // Close queues
    await Promise.all(Object.values(queues).map(queue => queue.close()));

    logger.info('Job queues closed');
};

module.exports = {
    queues,
    workers,
    addJob,
    emailJobs,
    notificationJobs,
    paymentJobs,
    shippingJobs,
    reportJobs,
    cleanupJobs,
    analyticsJobs,
    setupRecurringJobs,
    closeQueues
};