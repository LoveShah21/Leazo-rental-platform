const pino = require('pino');
const path = require('path');

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

const loggerConfig = {
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

    // Pretty print in development
    ...(isDevelopment && {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname'
            }
        }
    }),

    // Structured logging in production
    ...(!isDevelopment && !isTest && {
        formatters: {
            level: (label) => {
                return { level: label };
            }
        },
        timestamp: pino.stdTimeFunctions.isoTime
    }),

    // Silent in test environment
    ...(isTest && {
        level: 'silent'
    })
};

const logger = pino(loggerConfig);

// Add correlation ID support
const withCorrelationId = (correlationId) => {
    return logger.child({ correlationId });
};

// Add request context
const withRequestContext = (req) => {
    return logger.child({
        correlationId: req.correlationId,
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: req.user?.id
    });
};

// Error logging helper
const logError = (error, context = {}) => {
    logger.error({
        error: {
            message: error.message,
            stack: error.stack,
            name: error.name
        },
        ...context
    }, 'Error occurred');
};

// Performance logging helper
const logPerformance = (operation, duration, context = {}) => {
    logger.info({
        operation,
        duration,
        ...context
    }, `Performance: ${operation} took ${duration}ms`);
};

// Security event logging
const logSecurityEvent = (event, details = {}) => {
    logger.warn({
        securityEvent: event,
        ...details,
        timestamp: new Date().toISOString()
    }, `Security event: ${event}`);
};

// Business event logging
const logBusinessEvent = (event, details = {}) => {
    logger.info({
        businessEvent: event,
        ...details,
        timestamp: new Date().toISOString()
    }, `Business event: ${event}`);
};

module.exports = {
    ...logger,
    withCorrelationId,
    withRequestContext,
    logError,
    logPerformance,
    logSecurityEvent,
    logBusinessEvent
};