const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');
const Booking = require('../models/Booking');
const { authenticate } = require('../middleware/auth');
const emailService = require('../services/emailService');

// Create payment session
router.post('/create-session', authenticate, async (req, res) => {
    try {
        const { orderId, amount, customerDetails } = req.body;

        // Validate booking exists
        const booking = await Booking.findOne({ bookingNumber: orderId });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const result = await paymentService.createPaymentSession({
            orderId,
            amount,
            customerDetails
        });

        if (result.success) {
            // Update booking with payment session info
            await Booking.findOneAndUpdate(
                { bookingNumber: orderId },
                {
                    'payment.transactionId': result.sessionId,
                    'payment.status': 'pending'
                }
            );

            res.json({
                success: true,
                sessionId: result.sessionId,
                paymentUrl: result.paymentUrl
            });
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (error) {
        console.error('Payment session creation error:', error);
        res.status(500).json({ error: 'Failed to create payment session' });
    }
});

// Verify payment
router.post('/verify/:orderId', authenticate, async (req, res) => {
    try {
        const { orderId } = req.params;

        const result = await paymentService.verifyPayment(orderId);

        if (result.success) {
            res.json({
                success: true,
                status: result.status,
                paymentId: result.paymentId,
                amount: result.amount,
                method: result.method
            });
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});

// Process refund
router.post('/refund', authenticate, async (req, res) => {
    try {
        const { paymentId, refundAmount, reason } = req.body;

        const result = await paymentService.refundPayment(paymentId, refundAmount, reason);

        if (result.success) {
            res.json({
                success: true,
                refundId: result.refundId,
                status: result.status
            });
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (error) {
        console.error('Refund processing error:', error);
        res.status(500).json({ error: 'Failed to process refund' });
    }
});

// Payment callback (for redirect after payment)
router.get('/callback', async (req, res) => {
    try {
        const accepts = (req.get('accept') || '').toLowerCase();
        const wantsJson = accepts.includes('application/json') || req.query.format === 'json';
        const { order_id } = req.query;

        if (!order_id) {
            if (wantsJson) {
                return res.status(400).json({ success: false, error: 'order_id is required' });
            }
            return res.redirect(`${process.env.FRONTEND_URL || ''}/payment/error`);
        }

        // Verify payment status
        const result = await paymentService.verifyPayment(order_id);

        if (wantsJson) {
            const statusCode = result.success ? 200 : 400;
            return res.status(statusCode).json({ success: !!result.success, status: result.status || 'UNKNOWN' });
        }

        if (result.success && result.status === 'PAID') {
            // Redirect to success page
            res.redirect(`${process.env.FRONTEND_URL}/payment/success?orderId=${order_id}`);
        } else {
            // Redirect to failure page
            res.redirect(`${process.env.FRONTEND_URL}/payment/failed?orderId=${order_id}`);
        }
    } catch (error) {
        console.error('Payment callback error:', error);
        const accepts = (req.get('accept') || '').toLowerCase();
        const wantsJson = accepts.includes('application/json') || req.query.format === 'json';
        if (wantsJson) {
            return res.status(500).json({ success: false, error: 'Payment callback error' });
        }
        res.redirect(`${process.env.FRONTEND_URL || ''}/payment/error`);
    }
});

// TEST: simulate payment status and send emails/invoice
router.post('/test/simulate', authenticate, async (req, res) => {
    try {
        const { bookingNumber, status } = req.body;
        const result = await paymentService.simulatePaymentStatus(bookingNumber, status || 'PAID');
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Payment simulate error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// TEST: generate invoice for a booking
router.post('/test/invoice', authenticate, async (req, res) => {
    try {
        const { bookingId } = req.body;
        const result = await paymentService.generateInvoice({ bookingId });
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// TEST: email connectivity
router.get('/test/email', async (req, res) => {
    const result = await emailService.testConnection();
    res.status(result.success ? 200 : 500).json(result);
});

module.exports = router;