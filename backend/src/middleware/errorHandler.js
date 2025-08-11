const logger = require('../utils/logger');
const { ZodError } = require('zod');

const errorHandler = (error, req, res, next) => {
    const requestLogger = logger.withRequestContext(req);

    // Default error response
    let statusCode = 500;
    let message = 'Internal Server Error';
    let details = null;

    // Handle different error types
    if (error.name === 'ValidationError') {
        // Mongoose validation error
        statusCode = 400;
        message = 'Validation Error';
        details = Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message
        }));
    } else if (error instanceof ZodError) {
        // Zod validation error
        statusCode = 400;
        message = 'Validation Error';
        details = error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
        }));
    } else if (error.name === 'CastError') {
        // MongoDB cast error (invalid ObjectId, etc.)
        statusCode = 400;
        message = 'Invalid ID format';
    } else if (error.code === 11000) {
        // MongoDB duplicate key error
        statusCode = 409;
        message = 'Duplicate entry';
        const field = Object.keys(error.keyValue)[0];
        details = `${field} already exists`;
    } else if (error.name === 'JsonWebTokenError') {
        // JWT error
        statusCode = 401;
        message = 'Invalid token';
    } else if (error.name === 'TokenExpiredError') {
        // JWT expired
        statusCode = 401;
        message = 'Token expired';
    } else if (error.name === 'UnauthorizedError') {
        // Custom unauthorized error
        statusCode = 401;
        message = error.message || 'Unauthorized';
    } else if (error.name === 'ForbiddenError') {
        // Custom forbidden error
        statusCode = 403;
        message = error.message || 'Forbidden';
    } else if (error.name === 'NotFoundError') {
        // Custom not found error
        statusCode = 404;
        message = error.message || 'Resource not found';
    } else if (error.name === 'ConflictError') {
        // Custom conflict error
        statusCode = 409;
        message = error.message || 'Conflict';
    } else if (error.statusCode || error.status) {
        // Custom error with status code
        statusCode = error.statusCode || error.status;
        message = error.message;
    }

    // Log error based on severity
    if (statusCode >= 500) {
        requestLogger.error({
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name
            },
            statusCode,
            url: req.url,
            method: req.method,
            body: req.body,
            params: req.params,
            query: req.query
        }, 'Server error occurred');
    } else if (statusCode >= 400) {
        requestLogger.warn({
            error: {
                message: error.message,
                name: error.name
            },
            statusCode,
            url: req.url,
            method: req.method
        }, 'Client error occurred');
    }

    // Send error response
    const errorResponse = {
        success: false,
        error: {
            message,
            ...(details && { details }),
            ...(process.env.NODE_ENV === 'development' && {
                stack: error.stack,
                name: error.name
            })
        },
        timestamp: new Date().toISOString(),
        correlationId: req.correlationId
    };

    res.status(statusCode).json(errorResponse);
};

const notFoundHandler = (req, res) => {
    const requestLogger = logger.withRequestContext(req);

    requestLogger.warn({
        url: req.url,
        method: req.method
    }, 'Route not found');

    res.status(404).json({
        success: false,
        error: {
            message: 'Route not found',
            path: req.url,
            method: req.method
        },
        timestamp: new Date().toISOString(),
        correlationId: req.correlationId
    });
};

// Custom error classes
class AppError extends Error {
    constructor(message, statusCode = 500, name = 'AppError') {
        super(message);
        this.name = name;
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 400, 'ValidationError');
        this.details = details;
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401, 'UnauthorizedError');
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403, 'ForbiddenError');
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NotFoundError');
    }
}

class ConflictError extends AppError {
    constructor(message = 'Conflict') {
        super(message, 409, 'ConflictError');
    }
}

class TooManyRequestsError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, 429, 'TooManyRequestsError');
    }
}

module.exports = {
    errorHandler,
    notFoundHandler,
    AppError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    TooManyRequestsError
};