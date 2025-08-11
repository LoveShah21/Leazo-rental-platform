const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Booking = require('../models/Booking');
const paymentService = require('../services/paymentService');

// Cashfree webhook handler
router.post('/cashfree', express.raw({ type: 'application/json' }), async (req, res) => {
    const signature = req.headers['x-webhook-signature'];
    const rawBody = req.body.toString();

    // Verify webhook signature
    if (!paymentService.verifyWebhookSignature(rawBody, signature)) {
        console.log('Invalid webhook signature');
        return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(rawBody);
    const { type, data } = event;

    try {
        switch (type) {
            case 'PAYMENT_SUCCESS_WEBHOOK':
                console.log('Payment successful:', data.order.order_id);

                await Booking.findOneAndUpdate(
                    { bookingNumber: data.order.order_id },
                    {
                        status: 'confirmed',
                        'payment.status': 'completed',
                        'payment.transactionId': data.payment.cf_payment_id,
                        'payment.method': 'cashfree',
                        'payment.paidAt': new Date()
                    }
                );
                break;

            case 'PAYMENT_FAILED_WEBHOOK':
                console.log('Payment failed:', data.order.order_id);

                await Booking.findOneAndUpdate(
                    { bookingNumber: data.order.order_id },
                    {
                        status: 'cancelled',
                        'payment.status': 'failed'
                    }
                );
                break;

            case 'PAYMENT_USER_DROPPED_WEBHOOK':
                console.log('Payment dropped by user:', data.order.order_id);

                await Booking.findOneAndUpdate(
                    { bookingNumber: data.order.order_id },
                    {
                        status: 'cancelled',
                        'payment.status': 'cancelled'
                    }
                );
                break;

            default:
                console.log(`Unhandled webhook event: ${type}`);
        }

        res.json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Delhivery webhook handler
router.post('/delhivery', express.json(), async (req, res) => {
    const webhookSecret = process.env.DELHIVERY_WEBHOOK_SECRET;
    const signature = req.headers['x-delhivery-signature'];

    // Verify webhook signature if provided
    if (webhookSecret && signature) {
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (signature !== expectedSignature) {
            return res.status(400).json({ error: 'Invalid signature' });
        }
    }

    const { waybill, status, status_date, location } = req.body;

    try {
        // Update booking with shipping status
        await Booking.findOneAndUpdate(
            { 'shipment.outbound.awbCode': waybill },
            {
                'shipment.outbound.status': status.toLowerCase(),
                'shipment.outbound.lastTrackedLocation': location,
                'shipment.outbound.lastTrackedAt': new Date(status_date)
            }
        );

        console.log(`Shipping update: ${waybill} - ${status} at ${location}`);
        res.json({ status: 'ok' });
    } catch (error) {
        console.error('Shipping webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

module.exports = router;