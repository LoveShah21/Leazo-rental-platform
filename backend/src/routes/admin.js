const express = require('express');
const { z } = require('zod');
const mongoose = require('mongoose');

const User = require('../models/User');
const Product = require('../models/Product');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Location = require('../models/Location');
const { authenticate, requireAdmin, requireManager, requireStaff } = require('../middleware/auth');
const { cache } = require('../config/redis');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { createUploadMiddleware } = require('../config/cloudinary');
const shippingService = require('../services/shippingService');
const paymentService = require('../services/paymentService');
const logger = require('../utils/logger');

const router = express.Router();

// All admin routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard data
 * @access  Admin
 */
router.get('/dashboard', requireStaff, async (req, res, next) => {
    try {
        const { period = '30d' } = req.query;

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
            case '7d':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(endDate.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(endDate.getDate() - 30);
        }

        // Get statistics
        const [
            userStats,
            productStats,
            bookingStats,
            paymentStats,
            recentBookings,
            recentUsers,
            topProducts
        ] = await Promise.all([
            // User statistics
            User.aggregate([
                {
                    $facet: {
                        total: [{ $count: 'count' }],
                        new: [
                            { $match: { createdAt: { $gte: startDate } } },
                            { $count: 'count' }
                        ],
                        active: [
                            { $match: { isActive: true } },
                            { $count: 'count' }
                        ],
                        byRole: [
                            { $group: { _id: '$role', count: { $sum: 1 } } }
                        ]
                    }
                }
            ]),

            // Product statistics
            Product.aggregate([
                {
                    $facet: {
                        total: [{ $count: 'count' }],
                        active: [
                            { $match: { status: 'active' } },
                            { $count: 'count' }
                        ],
                        byCategory: [
                            { $group: { _id: '$category', count: { $sum: 1 } } }
                        ]
                    }
                }
            ]),

            // Booking statistics
            Booking.getStatistics(startDate, endDate),

            // Payment statistics
            paymentService.getPaymentStatistics(startDate, endDate),

            // Recent bookings
            Booking.find()
                .populate('customer', 'firstName lastName email')
                .populate('product', 'name slug')
                .sort({ createdAt: -1 })
                .limit(10)
                .lean(),

            // Recent users
            User.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .select('firstName lastName email role createdAt isActive')
                .lean(),

            // Top products by bookings
            Booking.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                { $group: { _id: '$product', bookings: { $sum: 1 }, revenue: { $sum: '$pricing.totalAmount' } } },
                { $sort: { bookings: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: '$product' },
                {
                    $project: {
                        name: '$product.name',
                        slug: '$product.slug',
                        bookings: 1,
                        revenue: 1
                    }
                }
            ])
        ]);

        const dashboard = {
            period,
            users: {
                total: userStats[0]?.total[0]?.count || 0,
                new: userStats[0]?.new[0]?.count || 0,
                active: userStats[0]?.active[0]?.count || 0,
                byRole: userStats[0]?.byRole || []
            },
            products: {
                total: productStats[0]?.total[0]?.count || 0,
                active: productStats[0]?.active[0]?.count || 0,
                byCategory: productStats[0]?.byCategory || []
            },
            bookings: bookingStats,
            payments: paymentStats,
            recent: {
                bookings: recentBookings,
                users: recentUsers
            },
            topProducts
        };

        res.json({
            success: true,
            data: { dashboard }
        });

    } catch (error) {
        next(error);
    }
});

// User Management Routes
/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filters
 * @access  Admin
 */
router.get('/users', requireStaff, async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            role,
            isActive,
            sort = 'createdAt'
        } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                { firstName: new RegExp(search, 'i') },
                { lastName: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ];
        }

        if (role) query.role = role;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortQuery = sort === 'name' ? { firstName: 1, lastName: 1 } : { [sort]: -1 };

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort(sortQuery)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            User.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get single user
 * @access  Admin
 */
router.get('/users/:id', requireStaff, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('plan');

        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Get user's booking statistics
        const bookingStats = await Booking.aggregate([
            { $match: { customer: user._id } },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    totalSpent: { $sum: '$pricing.totalAmount' },
                    statusBreakdown: { $push: '$status' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                user,
                stats: bookingStats[0] || { totalBookings: 0, totalSpent: 0, statusBreakdown: [] }
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/admin/users/:id
 * @desc    Update user
 * @access  Admin
 */
router.patch('/users/:id', requireAdmin, async (req, res, next) => {
    try {
        const allowedUpdates = ['firstName', 'lastName', 'phone', 'role', 'isActive', 'isEmailVerified'];
        const updates = {};

        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Invalidate cached user to prevent stale role/flags causing authorization bugs
        try {
            await cache.del(`user:${req.params.id}`);
        } catch (e) {
            logger.warn({ userId: req.params.id, error: e?.message }, 'Failed to invalidate user cache after update');
        }

        logger.info(`User updated by admin: ${req.params.id} by ${req.user.id}`);

        res.json({
            success: true,
            message: 'User updated successfully',
            data: { user }
        });

    } catch (error) {
        next(error);
    }
});

// Product Management Routes
/**
 * @route   GET /api/admin/products
 * @desc    Get all products for admin
 * @access  Staff
 */
router.get('/products', requireStaff, async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            category,
            status,
            sort = 'createdAt'
        } = req.query;

        const query = {};

        if (search) {
            query.$text = { $search: search };
        }

        if (category) query.category = category;
        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortQuery = { [sort]: -1 };

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('owner', 'firstName lastName')
                .sort(sortQuery)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Product.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/admin/products
 * @desc    Create new product
 * @access  Staff
 */
router.post('/products', requireStaff, createUploadMiddleware('products', 'images', 10), async (req, res, next) => {
    try {
        const productData = JSON.parse(req.body.productData || '{}');

        // Add uploaded images
        if (req.files && req.files.length > 0) {
            productData.images = req.files.map((file, index) => ({
                url: file.path,
                publicId: file.filename,
                alt: `${productData.name} image ${index + 1}`,
                isPrimary: index === 0
            }));
        }

        productData.owner = req.user.id;
        productData.createdBy = req.user.id;

        const product = new Product(productData);
        await product.save();

        logger.info(`Product created by admin: ${product._id} by ${req.user.id}`);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { product }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/admin/products/:id
 * @desc    Update product
 * @access  Staff
 */
router.patch('/products/:id', requireStaff, async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedBy: req.user.id },
            { new: true, runValidators: true }
        );

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        logger.info(`Product updated by admin: ${req.params.id} by ${req.user.id}`);

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: { product }
        });

    } catch (error) {
        next(error);
    }
});

// Booking Management Routes
/**
 * @route   GET /api/admin/bookings
 * @desc    Get all bookings for admin
 * @access  Staff
 */
router.get('/bookings', requireStaff, async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            startDate,
            endDate,
            customerId,
            productId
        } = req.query;

        const query = {};

        if (status) query.status = status;
        if (customerId) query.customer = customerId;
        if (productId) query.product = productId;

        if (startDate || endDate) {
            query.startDate = {};
            if (startDate) query.startDate.$gte = new Date(startDate);
            if (endDate) query.startDate.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [bookings, total] = await Promise.all([
            Booking.find(query)
                .populate('customer', 'firstName lastName email')
                .populate('product', 'name slug')
                .populate('location', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Booking.countDocuments(query)
        ]);

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
        next(error);
    }
});

// Shipping (Delhivery) Integration Routes
/**
 * @route   POST /api/admin/shipping/create
 * @desc    Create Delhivery shipment for a booking
 * @access  Staff
 */
router.post('/shipping/create', requireStaff, async (req, res, next) => {
    try {
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId)
            .populate('customer')
            .populate('product')
            .populate('location');

        if (!booking) {
            throw new NotFoundError('Booking not found');
        }

        const result = await shippingService.createShipment({
            orderId: booking.bookingNumber,
            customerDetails: {
                name: `${booking.customer.firstName} ${booking.customer.lastName}`.trim(),
                phone: booking.customer.phone
            },
            shippingAddress: {
                address: booking.delivery?.deliveryAddress?.street || booking.delivery?.pickupAddress?.street,
                city: booking.delivery?.deliveryAddress?.city || booking.delivery?.pickupAddress?.city,
                state: booking.delivery?.deliveryAddress?.state || booking.delivery?.pickupAddress?.state,
                pincode: booking.delivery?.deliveryAddress?.postalCode || booking.delivery?.pickupAddress?.postalCode,
                country: booking.delivery?.deliveryAddress?.country || booking.delivery?.pickupAddress?.country || 'India'
            },
            items: [{ name: booking.product.name, quantity: booking.quantity }],
            weight: 1,
            dimensions: {
                width: booking.product.specifications?.dimensions?.width || 10,
                height: booking.product.specifications?.dimensions?.height || 10
            },
            amount: booking.pricing.totalAmount
        });

        if (result.success) {
            await Booking.findByIdAndUpdate(bookingId, {
                'shipment.outbound.awbCode': result.waybill,
                'shipment.outbound.status': result.status?.toLowerCase?.() || 'shipped',
                'shipment.outbound.trackingUrl': result.trackingUrl,
                'shipment.outbound.pickupCompleted': new Date()
            });
        }

        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/admin/shipping/track/:waybill
 * @desc    Track shipment via Delhivery
 * @access  Staff
 */
router.get('/shipping/track/:waybill', requireStaff, async (req, res, next) => {
    try {
        const result = await shippingService.trackShipment(req.params.waybill);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/admin/shipping/cancel
 * @desc    Cancel Delhivery shipment
 * @access  Staff
 */
router.post('/shipping/cancel', requireStaff, async (req, res, next) => {
    try {
        const { waybill } = req.body;
        const result = await shippingService.cancelShipment(waybill);

        if (result.success) {
            await Booking.findOneAndUpdate(
                { 'shipment.outbound.awbCode': waybill },
                { 'shipment.outbound.status': 'cancelled', 'shipment.outbound.cancelledAt': new Date() }
            );
        }

        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/admin/settings
 * @desc    Get admin settings
 * @access  Admin
 */
router.get('/settings', requireAdmin, async (req, res, next) => {
    try {
        // This would typically come from a settings collection
        const settings = {
            general: {
                siteName: 'Rental Management',
                currency: 'INR',
                timezone: 'Asia/Kolkata',
                language: 'en'
            },
            booking: {
                maxAdvanceBookingDays: 30,
                defaultHoldDurationMinutes: 10,
                maxHoldExtensionMinutes: 30,
                lateFeeGracePeriodHours: 24
            },
            payment: {
                enabledGateways: ['cashfree'],
                defaultGateway: 'cashfree',
                taxRate: 0.18
            },
            shipping: {
                provider: 'delhivery',
                enabled: true
            }
        };

        res.json({
            success: true,
            data: { settings }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;