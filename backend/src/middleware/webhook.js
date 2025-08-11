const express = require('express');

// Middleware to handle raw body for webhook signature verification
const webhookRawBody = (req, res, next) => {
    if (req.originalUrl === '/api/webhooks/stripe') {
        // For Stripe webhooks, we need the raw body
        let data = '';
        req.setEncoding('utf8');

        req.on('data', chunk => {
            data += chunk;
        });

        req.on('end', () => {
            req.rawBody = data;
            next();
        });
    } else {
        next();
    }
};

module.exports = { webhookRawBody };