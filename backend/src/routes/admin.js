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
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { createUploadMiddleware } = require('../config/cloudinary');
const shiprocketService = require('../services/shiprocketService');
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

// Shiprocket Integration Routes
/**
 * @route   GET /api/admin/shiprocket/pickup-addresses
 * @desc    Get Shiprocket pickup addresses
 * @access  Staff
 */
router.get('/shiprocket/pickup-addresses', requireStaff, async (req, res, next) => {
    try {
        const addresses = await shiprocketService.getPickupLocations();

        res.json({
            success: true,
            data: { addresses }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/admin/shiprocket/orders
 * @desc    Create Shiprocket order
 * @access  Staff
 */
router.post('/shiprocket/orders', requireStaff, async (req, res, next) => {
    try {
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId)
            .populate('customer')
            .populate('product')
            .populate('location');

        if (!booking) {
            throw new NotFoundError('Booking not found');
        }

        // Create Shiprocket order
        const orderData = {
            order_id: booking.bookingNumber,
            order_date: booking.createdAt.toISOString().split('T')[0],
            pickup_location: booking.location.shiprocket?.pickupLocationId || 'Primary',
            billing_customer_name: booking.customer.firstName,
            billing_last_name: booking.customer.lastName,
            billing_address: booking.delivery.deliveryAddress?.street || booking.delivery.pickupAddress?.street,
            billing_city: booking.delivery.deliveryAddress?.city || booking.delivery.pickupAddress?.city,
            billing_pincode: booking.delivery.deliveryAddress?.postalCode || booking.delivery.pickupAddress?.postalCode,
            billing_state: booking.delivery.deliveryAddress?.state || booking.delivery.pickupAddress?.state,
            billing_country: booking.delivery.deliveryAddress?.country || booking.delivery.pickupAddress?.country || 'India',
            billing_email: booking.customer.email,
            billing_phone: booking.customer.phone,
            order_items: [{
                name: booking.product.name,
                sku: booking.product.slug,
                units: booking.quantity,
                selling_price: booking.pricing.baseAmount / booking.quantity
            }],
            payment_method: 'Prepaid',
            sub_total: booking.pricing.totalAmount,
            weight: booking.product.specifications?.weight || 1,
            length: booking.product.specifications?.dimensions?.length || 10,
            breadth: booking.product.specifications?.dimensions?.width || 10,
            height: booking.product.specifications?.dimensions?.height || 10
        };

        const result = await shiprocketService.createOrder(orderData);

        if (result.success) {
            // Update booking with shipment details
            booking.shipment.outbound.shiprocketOrderId = result.order_id;
            booking.shipment.outbound.shiprocketShipmentId = result.shipment_id;
            await booking.save();

            logger.info(`Shiprocket order created: ${result.order_id} for booking ${bookingId}`);
        }

        res.json({
            success: true,
            message: 'Shiprocket order created successfully',
            data: result
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/admin/shiprocket/pickup
 * @desc    Schedule pickup
 * @access  Staff
 */
router.post('/shiprocket/pickup', requireStaff, async (req, res, next) => {
    try {
        const { shipmentId, pickupDate, pickupTime } = req.body;

        const result = await shiprocketService.schedulePickup({
            shipment_id: shipmentId,
            pickup_date: pickupDate,
            pickup_time: pickupTime
        });

        res.json({
            success: true,
            message: 'Pickup scheduled successfully',
            data: result
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/admin/shiprocket/track/:awb
 * @desc    Track shipment
 * @access  Staff
 */
router.get('/shiprocket/track/:awb', requireStaff, async (req, res, next) => {
    try {
        const result = await shiprocketService.trackShipment(req.params.awb);

        res.json({
            success: true,
            data: result
        });

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
                enabledGateways: ['stripe', 'razorpay'],
                defaultGateway: 'razorpay',
                taxRate: 0.18
            },
            shiprocket: {
                enabled: true,
                defaultPickupLocation: 'Primary'
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