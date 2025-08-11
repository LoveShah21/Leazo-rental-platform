const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');
const Booking = require('../models/Booking');
const { authenticate } = require('../middleware/auth');

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
        const { order_id, order_token } = req.query;

        // Verify payment status
        const result = await paymentService.verifyPayment(order_id);

        if (result.success && result.status === 'PAID') {
            // Redirect to success page
            res.redirect(`${process.env.FRONTEND_URL}/payment/success?orderId=${order_id}`);
        } else {
            // Redirect to failure page
            res.redirect(`${process.env.FRONTEND_URL}/payment/failed?orderId=${order_id}`);
        }
    } catch (error) {
        console.error('Payment callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/payment/error`);
    }
});

module.exports = router;