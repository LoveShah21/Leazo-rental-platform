const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
    // Generate correlation ID for request tracking
    req.correlationId = req.headers['x-correlation-id'] || uuidv4();

    // Add correlation ID to response headers
    res.setHeader('X-Correlation-ID', req.correlationId);

    const startTime = Date.now();
    const requestLogger = logger.withRequestContext(req);

    // Log incoming request
    requestLogger.info({
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        contentLength: req.get('Content-Length'),
        ...(req.body && Object.keys(req.body).length > 0 && {
            bodyKeys: Object.keys(req.body)
        })
    }, 'Incoming request');

    // Override res.json to log response
    const originalJson = res.json;
    res.json = function (body) {
        const duration = Date.now() - startTime;

        requestLogger.info({
            statusCode: res.statusCode,
            duration,
            contentLength: res.get('Content-Length'),
            ...(body && typeof body === 'object' && {
                responseKeys: Object.keys(body)
            })
        }, 'Request completed');

        // Log slow requests
        if (duration > 1000) {
            requestLogger.warn({
                duration,
                method: req.method,
                url: req.url
            }, 'Slow request detected');
        }

        return originalJson.call(this, body);
    };

    // Override res.send to log response for non-JSON responses
    const originalSend = res.send;
    res.send = function (body) {
        if (!res.headersSent && res.statusCode !== 304) {
            const duration = Date.now() - startTime;

            requestLogger.info({
                statusCode: res.statusCode,
                duration,
                contentLength: res.get('Content-Length')
            }, 'Request completed');

            // Log slow requests
            if (duration > 1000) {
                requestLogger.warn({
                    duration,
                    method: req.method,
                    url: req.url
                }, 'Slow request detected');
            }
        }

        return originalSend.call(this, body);
    };

    next();
};

module.exports = {
    requestLogger
};