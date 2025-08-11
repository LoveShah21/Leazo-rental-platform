const express = require('express');
const router = express.Router();
const shippingService = require('../services/shippingService');
const Booking = require('../models/Booking');
const { authenticate } = require('../middleware/auth');

// Create shipment
router.post('/create', authenticate, async (req, res) => {
    try {
        const { orderId } = req.body;

        // Get booking details
        const booking = await Booking.findOne({ bookingNumber: orderId }).populate('customer product location');
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.payment.status !== 'completed') {
            return res.status(400).json({ error: 'Booking payment not completed' });
        }

        const result = await shippingService.createShipment({
            orderId: booking.bookingNumber,
            customerDetails: {
                name: booking.delivery.contactPerson.name,
                phone: booking.delivery.contactPerson.phone
            },
            shippingAddress: booking.delivery.deliveryAddress,
            items: [{
                product: booking.product,
                quantity: booking.quantity
            }],
            weight: 0.5, // Default weight
            dimensions: { length: 10, width: 10, height: 10 },
            amount: booking.pricing.totalAmount
        });

        if (result.success) {
            // Update booking with shipping info
            await Booking.findOneAndUpdate(
                { bookingNumber: orderId },
                {
                    'shipment.outbound.awbCode': result.waybill,
                    'shipment.outbound.status': 'shipped',
                    'shipment.outbound.trackingUrl': result.trackingUrl,
                    'shipment.outbound.pickupCompleted': new Date()
                }
            );

            res.json({
                success: true,
                waybill: result.waybill,
                trackingUrl: result.trackingUrl
            });
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (error) {
        console.error('Shipment creation error:', error);
        res.status(500).json({ error: 'Failed to create shipment' });
    }
});

// Track shipment
router.get('/track/:waybill', async (req, res) => {
    try {
        const { waybill } = req.params;

        const result = await shippingService.trackShipment(waybill);

        if (result.success) {
            res.json({
                success: true,
                status: result.status,
                location: result.location,
                statusDate: result.statusDate,
                scans: result.scans
            });
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (error) {
        console.error('Shipment tracking error:', error);
        res.status(500).json({ error: 'Failed to track shipment' });
    }
});

// Cancel shipment
router.post('/cancel', authenticate, async (req, res) => {
    try {
        const { waybill } = req.body;

        const result = await shippingService.cancelShipment(waybill);

        if (result.success) {
            // Update booking status
            await Booking.findOneAndUpdate(
                { 'shipment.outbound.awbCode': waybill },
                {
                    'shipment.outbound.status': 'cancelled',
                    'shipment.outbound.cancelledAt': new Date()
                }
            );

            res.json({ success: true, message: result.message });
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (error) {
        console.error('Shipment cancellation error:', error);
        res.status(500).json({ error: 'Failed to cancel shipment' });
    }
});

// Calculate shipping cost
router.post('/calculate-cost', async (req, res) => {
    try {
        const { weight, fromPincode, toPincode, serviceType } = req.body;

        // Simple distance calculation (you can integrate with actual distance API)
        const distance = Math.abs(parseInt(fromPincode) - parseInt(toPincode)) / 1000;

        const cost = shippingService.calculateShippingCost(weight, distance, serviceType);

        res.json({
            success: true,
            shippingCost: cost,
            estimatedDays: serviceType === 'express' ? '1-2' : '3-5'
        });
    } catch (error) {
        console.error('Shipping cost calculation error:', error);
        res.status(500).json({ error: 'Failed to calculate shipping cost' });
    }
});

module.exports = router;