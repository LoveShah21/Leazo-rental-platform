const express = require('express');
const { z } = require('zod');
const { startOfDay, endOfDay, parseISO, isValid } = require('date-fns');

const Product = require('../models/Product');
const Booking = require('../models/Booking');
const Hold = require('../models/Hold');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { ValidationError, NotFoundError, ConflictError } = require('../middleware/errorHandler');
const { publishHoldCreated, publishHoldReleased } = require('../config/socket');
const logger = require('../utils/logger');

const router = express.Router();

// Validation schemas
const availabilityQuerySchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    locationId: z.string().min(1, 'Location ID is required'),
    startDate: z.string().refine(val => isValid(parseISO(val)), 'Invalid start date'),
    endDate: z.string().refine(val => isValid(parseISO(val)), 'Invalid end date')
});

const createHoldSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    locationId: z.string().min(1, 'Location ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    startDate: z.string().refine(val => isValid(parseISO(val)), 'Invalid start date'),
    endDate: z.string().refine(val => isValid(parseISO(val)), 'Invalid end date'),
    sessionId: z.string().optional()
});

/**
 * @route   GET /api/availability
 * @desc    Check product availability for given date range
 * @access  Public
 */
router.get('/', async (req, res, next) => {
    try {
        const validation = availabilityQuerySchema.safeParse(req.query);
        if (!validation.success) {
            throw new ValidationError('Invalid query parameters', validation.error.errors);
        }

        const { productId, locationId, startDate, endDate } = validation.data;

        const startDateTime = parseISO(startDate);
        const endDateTime = parseISO(endDate);

        // Validate date range
        if (startDateTime >= endDateTime) {
            throw new ValidationError('End date must be after start date');
        }

        // Check if dates are in the future
        const now = new Date();
        if (startDateTime < now) {
            throw new ValidationError('Start date cannot be in the past');
        }

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            throw new NotFoundError('Product not found');
        }

        // Check if product is available at the location
        const inventory = product.inventory.find(inv =>
            inv.locationId.toString() === locationId
        );

        if (!inventory) {
            return res.json({
                success: true,
                data: {
                    available: false,
                    reason: 'Product not available at this location',
                    maxQuantity: 0
                }
            });
        }

        // Find overlapping bookings
        const overlappingBookings = await Booking.findOverlapping(
            productId,
            locationId,
            startDateTime,
            endDateTime
        );

        // Find active holds
        const activeHolds = await Hold.findActiveHolds(
            productId,
            locationId,
            startDateTime,
            endDateTime
        );

        // Calculate reserved quantity
        const bookedQuantity = overlappingBookings.reduce((sum, booking) => sum + booking.quantity, 0);
        const heldQuantity = activeHolds.reduce((sum, hold) => sum + hold.quantity, 0);
        const totalReserved = bookedQuantity + heldQuantity;

        // Calculate available quantity
        const availableQuantity = Math.max(0, inventory.quantity - totalReserved);

        res.json({
            success: true,
            data: {
                available: availableQuantity > 0,
                maxQuantity: availableQuantity,
                totalStock: inventory.quantity,
                bookedQuantity,
                heldQuantity,
                details: {
                    overlappingBookings: overlappingBookings.length,
                    activeHolds: activeHolds.length
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/availability/holds
 * @desc    Create a temporary hold on inventory
 * @access  Private
 */
router.post('/holds', authenticate, async (req, res, next) => {
    try {
        const validation = createHoldSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError('Invalid request data', validation.error.errors);
        }

        const { productId, locationId, quantity, startDate, endDate, sessionId } = validation.data;

        const startDateTime = parseISO(startDate);
        const endDateTime = parseISO(endDate);

        // Validate date range
        if (startDateTime >= endDateTime) {
            throw new ValidationError('End date must be after start date');
        }

        // Check if dates are in the future
        const now = new Date();
        if (startDateTime < now) {
            throw new ValidationError('Start date cannot be in the past');
        }

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            throw new NotFoundError('Product not found');
        }

        // Check if product is active and visible
        if (product.status !== 'active' || !product.isVisible) {
            throw new ValidationError('Product is not available for booking');
        }

        // Check inventory at location
        const inventory = product.inventory.find(inv =>
            inv.locationId.toString() === locationId
        );

        if (!inventory) {
            throw new ValidationError('Product not available at this location');
        }

        // Check if requested quantity is available
        const availableQuantity = product.getAvailabilityAtLocation(locationId);

        // Find overlapping bookings and holds
        const [overlappingBookings, activeHolds] = await Promise.all([
            Booking.findOverlapping(productId, locationId, startDateTime, endDateTime),
            Hold.findActiveHolds(productId, locationId, startDateTime, endDateTime)
        ]);

        const bookedQuantity = overlappingBookings.reduce((sum, booking) => sum + booking.quantity, 0);
        const heldQuantity = activeHolds.reduce((sum, hold) => sum + hold.quantity, 0);
        const totalReserved = bookedQuantity + heldQuantity;
        const actualAvailable = Math.max(0, inventory.quantity - totalReserved);

        if (quantity > actualAvailable) {
            throw new ConflictError(`Only ${actualAvailable} items available for the selected dates`);
        }

        // Check if user already has an active hold for this product/location/dates
        const existingHold = await Hold.findOne({
            user: req.user.id,
            product: productId,
            location: locationId,
            status: 'active',
            startDate: { $lte: endDateTime },
            endDate: { $gte: startDateTime }
        });

        if (existingHold) {
            throw new ConflictError('You already have an active hold for this product and date range');
        }

        // Create the hold
        const hold = new Hold({
            user: req.user.id,
            product: productId,
            location: locationId,
            quantity,
            startDate: startDateTime,
            endDate: endDateTime,
            sessionId: sessionId || req.sessionID,
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip,
            metadata: {
                source: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'web'
            }
        });

        await hold.save();

        // Publish hold created event
        await publishHoldCreated({
            holdId: hold._id,
            userId: req.user.id,
            productId,
            locationId,
            quantity,
            startDate: startDateTime,
            endDate: endDateTime,
            expiresAt: hold.expiresAt
        });

        logger.info(`Hold created: ${hold._id} for user ${req.user.id}`);

        res.status(201).json({
            success: true,
            message: 'Hold created successfully',
            data: {
                hold: {
                    id: hold._id,
                    expiresAt: hold.expiresAt,
                    remainingTime: hold.remainingTime,
                    quantity: hold.quantity
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/availability/holds/:id
 * @desc    Cancel/release a hold
 * @access  Private
 */
router.delete('/holds/:id', authenticate, async (req, res, next) => {
    try {
        const holdId = req.params.id;

        const hold = await Hold.findById(holdId);
        if (!hold) {
            throw new NotFoundError('Hold not found');
        }

        // Check if user owns the hold or is staff
        if (hold.user.toString() !== req.user.id && !['staff', 'manager', 'admin', 'super_admin'].includes(req.user.role)) {
            throw new ValidationError('You can only cancel your own holds');
        }

        if (hold.status !== 'active') {
            throw new ValidationError('Hold is not active');
        }

        // Cancel the hold
        await hold.cancel(req.user.id, 'Cancelled by user');

        // Publish hold released event
        await publishHoldReleased({
            holdId: hold._id,
            userId: hold.user,
            productId: hold.product,
            locationId: hold.location,
            quantity: hold.quantity,
            reason: 'cancelled'
        });

        logger.info(`Hold cancelled: ${holdId} by user ${req.user.id}`);

        res.json({
            success: true,
            message: 'Hold cancelled successfully'
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/availability/holds
 * @desc    Get user's active holds
 * @access  Private
 */
router.get('/holds', authenticate, async (req, res, next) => {
    try {
        const status = req.query.status || 'active';

        const holds = await Hold.findByUser(req.user.id, status)
            .populate('product', 'name slug images pricing')
            .populate('location', 'name address')
            .limit(50);

        res.json({
            success: true,
            data: {
                holds: holds.map(hold => ({
                    id: hold._id,
                    product: hold.product,
                    location: hold.location,
                    quantity: hold.quantity,
                    startDate: hold.startDate,
                    endDate: hold.endDate,
                    status: hold.status,
                    expiresAt: hold.expiresAt,
                    remainingTime: hold.remainingTime,
                    createdAt: hold.createdAt
                }))
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/availability/holds/:id/extend
 * @desc    Extend a hold expiration time
 * @access  Private
 */
router.put('/holds/:id/extend', authenticate, async (req, res, next) => {
    try {
        const holdId = req.params.id;
        const { minutes = 10 } = req.body;

        if (minutes < 1 || minutes > 30) {
            throw new ValidationError('Extension must be between 1 and 30 minutes');
        }

        const hold = await Hold.findById(holdId);
        if (!hold) {
            throw new NotFoundError('Hold not found');
        }

        // Check if user owns the hold
        if (hold.user.toString() !== req.user.id) {
            throw new ValidationError('You can only extend your own holds');
        }

        if (hold.status !== 'active') {
            throw new ValidationError('Hold is not active');
        }

        // Extend the hold
        await hold.extend(minutes);

        logger.info(`Hold extended: ${holdId} by ${minutes} minutes`);

        res.json({
            success: true,
            message: 'Hold extended successfully',
            data: {
                hold: {
                    id: hold._id,
                    expiresAt: hold.expiresAt,
                    remainingTime: hold.remainingTime
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;