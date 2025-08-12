const express = require('express');
const { z } = require('zod');
const { startOfDay, endOfDay, parseISO, isValid, addDays } = require('date-fns');
const mongoose = require('mongoose');

const Booking = require('../models/Booking');
const Product = require('../models/Product');
const Location = require('../models/Location');
const Hold = require('../models/Hold');
const Payment = require('../models/Payment');
const { authenticate, requireOwnershipOrAdmin, requireStaff } = require('../middleware/auth');
const { ValidationError, NotFoundError, ConflictError } = require('../middleware/errorHandler');
const { publishBookingStatusChanged } = require('../config/socket');
const { emailJobs, paymentJobs } = require('../config/queue');
const paymentService = require('../services/paymentService');
const emailService = require('../services/emailService');
const invoiceService = require('../services/invoiceService');
const logger = require('../utils/logger');

const router = express.Router();

// Validation schemas
const createBookingSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    locationId: z.string().min(1, 'Location ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    startDate: z.string().refine(val => isValid(parseISO(val)), 'Invalid start date'),
    endDate: z.string().refine(val => isValid(parseISO(val)), 'Invalid end date'),
    paymentMethod: z.enum(['stripe', 'razorpay', 'cash', 'bank_transfer']),
    delivery: z.object({
        type: z.enum(['pickup', 'delivery', 'both']),
        pickupAddress: z.object({
            street: z.string(),
            city: z.string(),
            state: z.string(),
            country: z.string(),
            postalCode: z.string()
        }).optional(),
        deliveryAddress: z.object({
            street: z.string(),
            city: z.string(),
            state: z.string(),
            country: z.string(),
            postalCode: z.string()
        }).optional(),
        instructions: z.string().optional(),
        contactPerson: z.object({
            name: z.string(),
            phone: z.string(),
            email: z.string().email()
        }).optional()
    }),
    notes: z.object({
        customer: z.string().optional()
    }).optional(),
    holdId: z.string().optional() // If converting from a hold
});

const updateBookingStatusSchema = z.object({
    status: z.enum(['confirmed', 'approved', 'rejected', 'picked_up', 'in_use', 'returned', 'completed', 'cancelled']),
    reason: z.string().optional(),
    notes: z.string().optional()
});

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private
 */
router.post('/', authenticate, async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        const validation = createBookingSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError('Invalid booking data', validation.error.errors);
        }

        const {
            productId,
            locationId,
            quantity,
            startDate,
            endDate,
            paymentMethod,
            delivery,
            notes,
            holdId
        } = validation.data;

        const startDateTime = parseISO(startDate);
        const endDateTime = parseISO(endDate);

        // Validate date range
        if (startDateTime >= endDateTime) {
            throw new ValidationError('End date must be after start date');
        }

        if (startDateTime < new Date()) {
            throw new ValidationError('Start date cannot be in the past');
        }

        await session.withTransaction(async () => {
            // Find and validate product
            const product = await Product.findById(productId).session(session);
            if (!product || product.status !== 'active') {
                throw new NotFoundError('Product not found or not available');
            }

            // Find and validate location
            const location = await Location.findById(locationId).session(session);
            if (!location || !location.isActive) {
                throw new NotFoundError('Location not found or not active');
            }

            // Check inventory availability
            const inventory = product.inventory.find(inv =>
                inv.locationId.toString() === locationId
            );

            if (!inventory) {
                throw new ValidationError('Product not available at this location');
            }

            // Check for overlapping bookings
            const overlappingBookings = await Booking.findOverlapping(
                productId,
                locationId,
                startDateTime,
                endDateTime
            ).session(session);

            const bookedQuantity = overlappingBookings.reduce((sum, booking) => sum + booking.quantity, 0);
            const availableQuantity = inventory.quantity - bookedQuantity;

            if (quantity > availableQuantity) {
                throw new ConflictError(`Only ${availableQuantity} items available for the selected dates`);
            }

            // Calculate pricing
            const rentalDays = Math.ceil((endDateTime - startDateTime) / (1000 * 60 * 60 * 24));
            const baseAmount = product.pricing.basePrice.daily * quantity * rentalDays;
            const deposit = product.pricing.deposit.required ? product.pricing.deposit.amount * quantity : 0;
            const taxes = baseAmount * 0.18; // 18% GST (adjust as needed)
            const totalAmount = baseAmount + deposit + taxes;

            // Generate booking number
            const bookingNumber = await Booking.generateBookingNumber();

            // Create booking
            const booking = new Booking({
                bookingNumber,
                customer: new mongoose.Types.ObjectId(req.user.id),
                product: productId,
                location: locationId,
                quantity,
                startDate: startDateTime,
                endDate: endDateTime,
                pricing: {
                    baseAmount,
                    deposit,
                    taxes,
                    fees: 0,
                    discounts: 0,
                    lateFees: 0,
                    totalAmount,
                    currency: product.pricing.currency
                },
                payment: {
                    method: paymentMethod,
                    status: 'pending'
                },
                delivery,
                notes: notes || {},
                metadata: {
                    source: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'web',
                    userAgent: req.get('User-Agent'),
                    ipAddress: req.ip
                },
                createdBy: req.user.id
            });

            await booking.save({ session });

            logger.info('Booking created successfully:', {
                bookingId: booking._id,
                bookingNumber: booking.bookingNumber,
                customer: booking.customer
            });

            // Populate booking data for email
            await booking.populate([
                { path: 'customer', select: 'firstName lastName email phone' },
                { path: 'product', select: 'name slug images' },
                { path: 'location', select: 'name address' }
            ]);

            // Generate PDF attachments
            const attachments = [];

            try {
                // Generate invoice PDF
                const invoicePDF = await invoiceService.generateInvoicePDF({
                    bookingNumber: booking.bookingNumber,
                    customer: booking.customer,
                    product: booking.product,
                    location: booking.location,
                    quantity: booking.quantity,
                    startDate: booking.startDate,
                    endDate: booking.endDate,
                    pricing: booking.pricing,
                    createdAt: booking.createdAt
                });

                attachments.push({
                    filename: invoicePDF.fileName,
                    path: invoicePDF.filePath,
                    contentType: 'application/pdf'
                });

                // Generate booking confirmation PDF
                const confirmationPDF = await invoiceService.generateBookingConfirmationPDF({
                    bookingNumber: booking.bookingNumber,
                    customer: booking.customer,
                    product: booking.product,
                    location: booking.location,
                    quantity: booking.quantity,
                    startDate: booking.startDate,
                    endDate: booking.endDate,
                    status: booking.status,
                    delivery: booking.delivery,
                    notes: booking.notes
                });

                attachments.push({
                    filename: confirmationPDF.fileName,
                    path: confirmationPDF.filePath,
                    contentType: 'application/pdf'
                });

                logger.info('PDF attachments generated successfully', {
                    bookingNumber: booking.bookingNumber,
                    attachmentCount: attachments.length
                });

            } catch (pdfError) {
                logger.error('Error generating PDF attachments:', pdfError);
                // Continue without attachments if PDF generation fails
            }

            // Send booking confirmation email with attachments
            try {
                await emailService.sendBookingConfirmation({
                    customerEmail: booking.customer.email,
                    customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
                    bookingNumber: booking.bookingNumber,
                    productName: booking.product.name,
                    startDate: booking.startDate,
                    endDate: booking.endDate,
                    totalAmount: booking.pricing.totalAmount,
                    currency: booking.pricing.currency
                }, attachments);

                logger.info('Booking confirmation email sent successfully', {
                    bookingNumber: booking.bookingNumber,
                    customerEmail: booking.customer.email
                });

            } catch (emailError) {
                logger.error('Error sending booking confirmation email:', emailError);
                // Don't fail the booking creation if email fails
            }

            // Convert hold if provided
            if (holdId) {
                const hold = await Hold.findById(holdId).session(session);
                if (hold && hold.user.toString() === req.user.id && hold.status === 'active') {
                    await hold.convertToBooking(booking._id);
                }
            }

            // Create payment record
            const paymentData = {
                gateway: paymentMethod,
                bookingId: booking._id,
                amount: totalAmount,
                currency: product.pricing.currency,
                customerId: req.user.id,
                method: 'card', // Default, can be updated based on actual payment method
                breakdown: {
                    baseAmount,
                    taxes,
                    fees: 0,
                    discount: 0,
                    deposit
                },
                userAgent: req.get('User-Agent'),
                ipAddress: req.ip,
                source: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'web'
            };

            let paymentResult = null;
            if (paymentMethod !== 'cash') {
                paymentResult = await paymentService.processPayment(paymentData);
            }

            logger.info(`Booking created: ${booking.bookingNumber} for user ${req.user.id}`);

            res.status(201).json({
                success: true,
                message: 'Booking created successfully',
                data: {
                    booking: {
                        id: booking._id,
                        bookingNumber: booking.bookingNumber,
                        status: booking.status,
                        totalAmount: booking.pricing.totalAmount,
                        currency: booking.pricing.currency,
                        startDate: booking.startDate,
                        endDate: booking.endDate
                    },
                    payment: paymentResult
                }
            });
        });

    } catch (error) {
        next(error);
    } finally {
        await session.endSession();
    }
});

/**
 * @route   GET /api/bookings/debug
 * @desc    Debug user bookings
 * @access  Private
 */
router.get('/debug', authenticate, async (req, res, next) => {
    try {
        logger.info('Debug - User info:', {
            userId: req.user.id,
            userIdType: typeof req.user.id,
            user: req.user
        });

        // Get all bookings to see what's in the database
        const allBookings = await Booking.find({}).limit(5).lean();
        logger.info('Debug - Sample bookings:', allBookings);

        // Try different query variations
        const queries = [
            { customer: req.user.id },
            { customer: req.user._id },
            { customer: mongoose.Types.ObjectId(req.user.id) }
        ];

        const results = [];
        for (const query of queries) {
            try {
                const count = await Booking.countDocuments(query);
                results.push({ query, count });
            } catch (error) {
                results.push({ query, error: error.message });
            }
        }

        res.json({
            success: true,
            debug: {
                user: req.user,
                allBookingsCount: allBookings.length,
                sampleBookings: allBookings,
                queryResults: results
            }
        });

    } catch (error) {
        logger.error('Debug error:', error);
        next(error);
    }
});

/**
 * @route   GET /api/bookings
 * @desc    Get user bookings
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
    try {
        logger.info('Fetching bookings for user:', { userId: req.user.id });

        const {
            status,
            page = 1,
            limit = 20,
            startDate,
            endDate,
            sort = 'createdAt'
        } = req.query;

        // Ensure proper ObjectId format for customer query
        const customerId = mongoose.Types.ObjectId.isValid(req.user.id)
            ? new mongoose.Types.ObjectId(req.user.id)
            : req.user.id;

        const query = { customer: customerId };

        if (status) {
            query.status = status;
        }

        if (startDate || endDate) {
            query.startDate = {};
            if (startDate) query.startDate.$gte = parseISO(startDate);
            if (endDate) query.startDate.$lte = parseISO(endDate);
        }

        logger.info('Booking query:', query);

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortQuery = sort === 'startDate' ? { startDate: -1 } : { createdAt: -1 };

        const [bookings, total] = await Promise.all([
            Booking.find(query)
                .populate('product', 'name slug images pricing')
                .populate('location', 'name address')
                .sort(sortQuery)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Booking.countDocuments(query)
        ]);

        logger.info('Found bookings:', { count: bookings.length, total });

        res.json({
            success: true,
            data: {
                bookings,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        logger.error('Error fetching user bookings:', error);
        next(error);
    }
});

/**
 * @route   GET /api/bookings/:id
 * @desc    Get single booking
 * @access  Private
 */
router.get('/:id', authenticate, requireOwnershipOrAdmin(async (req) => {
    const booking = await Booking.findById(req.params.id);
    return booking?.customer;
}), async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('customer', 'firstName lastName email phone')
            .populate('product', 'name slug images pricing specifications')
            .populate('location', 'name address contact operatingHours')
            .populate('createdBy', 'firstName lastName')
            .populate('updatedBy', 'firstName lastName');

        if (!booking) {
            throw new NotFoundError('Booking not found');
        }

        // Get payment information
        const payment = await Payment.findOne({ booking: booking._id });

        res.json({
            success: true,
            data: {
                booking,
                payment
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/bookings/:id/status
 * @desc    Update booking status
 * @access  Private (Staff or booking owner for limited statuses)
 */
router.patch('/:id/status', authenticate, async (req, res, next) => {
    try {
        const validation = updateBookingStatusSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError('Invalid status update data', validation.error.errors);
        }

        const { status, reason, notes } = validation.data;
        const bookingId = req.params.id;

        const booking = await Booking.findById(bookingId)
            .populate('customer')
            .populate('product');

        if (!booking) {
            throw new NotFoundError('Booking not found');
        }

        // Check permissions
        const isOwner = booking.customer._id.toString() === req.user.id;
        const isStaff = ['staff', 'manager', 'admin', 'super_admin'].includes(req.user.role);

        // Define allowed status transitions for customers
        const customerAllowedStatuses = ['cancelled'];

        if (!isStaff && (!isOwner || !customerAllowedStatuses.includes(status))) {
            throw new ValidationError('You are not authorized to update this booking status');
        }

        // Validate status transitions
        const validTransitions = {
            'pending': ['confirmed', 'cancelled', 'rejected'],
            'confirmed': ['approved', 'cancelled', 'picked_up'],
            'approved': ['picked_up', 'cancelled'],
            'picked_up': ['in_use', 'returned'],
            'in_use': ['returned', 'overdue'],
            'returned': ['completed'],
            'overdue': ['returned', 'completed'],
            'cancelled': [], // Terminal state
            'completed': [], // Terminal state
            'rejected': [] // Terminal state
        };

        if (!validTransitions[booking.status]?.includes(status)) {
            throw new ValidationError(`Cannot transition from ${booking.status} to ${status}`);
        }

        // Update booking status
        await booking.updateStatus(status, req.user.id, reason, notes);

        // Handle status-specific logic
        switch (status) {
            case 'confirmed':
                // Send confirmation email
                await emailJobs.sendBookingConfirmation({
                    customerEmail: booking.customer.email,
                    customerName: booking.customer.fullName,
                    bookingNumber: booking.bookingNumber,
                    productName: booking.product.name,
                    startDate: booking.startDate,
                    endDate: booking.endDate,
                    totalAmount: booking.pricing.totalAmount,
                    currency: booking.pricing.currency
                });
                break;

            case 'picked_up':
                booking.actualStartDate = new Date();
                await booking.save();
                break;

            case 'returned':
                booking.actualEndDate = new Date();
                await booking.save();
                break;

            case 'completed':
                // Release any reserved inventory
                await Product.findByIdAndUpdate(booking.product._id, {
                    $inc: {
                        'inventory.$[elem].reserved': -booking.quantity
                    }
                }, {
                    arrayFilters: [{ 'elem.locationId': booking.location }]
                });
                break;

            case 'cancelled':
                // Release reserved inventory and process refund if applicable
                await Product.findByIdAndUpdate(booking.product._id, {
                    $inc: {
                        'inventory.$[elem].reserved': -booking.quantity
                    }
                }, {
                    arrayFilters: [{ 'elem.locationId': booking.location }]
                });

                // Process refund if payment was completed
                const payment = await Payment.findOne({ booking: bookingId, status: 'completed' });
                if (payment) {
                    await paymentJobs.processRefund({
                        paymentId: payment._id,
                        amount: payment.amount,
                        reason: 'Booking cancelled',
                        refundedBy: req.user.id
                    });
                }
                break;
        }

        // Publish status change event
        await publishBookingStatusChanged({
            bookingId: booking._id,
            userId: booking.customer._id,
            status: status,
            previousStatus: booking.statusHistory[booking.statusHistory.length - 2]?.status,
            changedBy: req.user.id,
            changedAt: new Date()
        });

        logger.info(`Booking status updated: ${bookingId} -> ${status} by ${req.user.id}`);

        res.json({
            success: true,
            message: 'Booking status updated successfully',
            data: {
                booking: {
                    id: booking._id,
                    status: booking.status,
                    updatedAt: booking.updatedAt
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/bookings/:id/extend
 * @desc    Extend booking duration
 * @access  Private
 */
router.post('/:id/extend', authenticate, requireOwnershipOrAdmin(async (req) => {
    const booking = await Booking.findById(req.params.id);
    return booking?.customer;
}), async (req, res, next) => {
    try {
        const { days } = req.body;

        if (!days || days < 1 || days > 30) {
            throw new ValidationError('Extension must be between 1 and 30 days');
        }

        const booking = await Booking.findById(req.params.id)
            .populate('product');

        if (!booking) {
            throw new NotFoundError('Booking not found');
        }

        if (!['confirmed', 'approved', 'picked_up', 'in_use'].includes(booking.status)) {
            throw new ValidationError('Booking cannot be extended in current status');
        }

        const newEndDate = addDays(booking.endDate, days);

        // Check availability for extended period
        const overlappingBookings = await Booking.findOverlapping(
            booking.product._id,
            booking.location,
            booking.endDate,
            newEndDate,
            booking._id
        );

        if (overlappingBookings.length > 0) {
            throw new ConflictError('Product not available for the extended period');
        }

        // Calculate additional cost
        const additionalAmount = booking.product.pricing.basePrice.daily * booking.quantity * days;
        const additionalTaxes = additionalAmount * 0.18;
        const totalAdditionalAmount = additionalAmount + additionalTaxes;

        // Update booking
        booking.endDate = newEndDate;
        booking.pricing.baseAmount += additionalAmount;
        booking.pricing.taxes += additionalTaxes;
        booking.pricing.totalAmount += totalAdditionalAmount;
        booking.updatedBy = req.user.id;

        await booking.save();

        // Create additional payment if needed
        if (totalAdditionalAmount > 0) {
            const paymentData = {
                gateway: booking.payment.method,
                bookingId: booking._id,
                amount: totalAdditionalAmount,
                currency: booking.pricing.currency,
                customerId: req.user.id,
                method: 'card',
                breakdown: {
                    baseAmount: additionalAmount,
                    taxes: additionalTaxes,
                    fees: 0,
                    discount: 0,
                    deposit: 0
                }
            };

            const paymentResult = await paymentService.processPayment(paymentData);

            return res.json({
                success: true,
                message: 'Booking extended successfully',
                data: {
                    booking: {
                        id: booking._id,
                        endDate: booking.endDate,
                        totalAmount: booking.pricing.totalAmount
                    },
                    additionalPayment: paymentResult
                }
            });
        }

        res.json({
            success: true,
            message: 'Booking extended successfully',
            data: {
                booking: {
                    id: booking._id,
                    endDate: booking.endDate,
                    totalAmount: booking.pricing.totalAmount
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/bookings/stats/overview
 * @desc    Get booking statistics overview
 * @access  Private (Staff only)
 */
router.get('/stats/overview', authenticate, requireStaff, async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        const stats = await Booking.getStatistics(
            startDate ? parseISO(startDate) : null,
            endDate ? parseISO(endDate) : null
        );

        res.json({
            success: true,
            data: { stats }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;