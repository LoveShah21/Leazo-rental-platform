const express = require('express');
const { z } = require('zod');
const mongoose = require('mongoose');

const User = require('../models/User');
const Product = require('../models/Product');
const Booking = require('../models/Booking');
const Location = require('../models/Location');
const Plan = require('../models/Plan');
const { authenticate, requireProvider, requireProviderOrStaff } = require('../middleware/auth');
const { ValidationError, NotFoundError, UnauthorizedError } = require('../middleware/errorHandler');
const { createUploadMiddleware } = require('../config/cloudinary');
const logger = require('../utils/logger');

const router = express.Router();

// All provider routes require authentication
router.use(authenticate);

// Validation schemas
const providerRegistrationSchema = z.object({
    businessName: z.string().min(1, 'Business name is required').max(100),
    businessType: z.enum(['individual', 'business', 'company']),
    businessRegistrationNumber: z.string().optional(),
    taxId: z.string().optional(),
    website: z.string().url().optional(),
    description: z.string().max(1000).optional(),
    bankDetails: z.object({
        accountHolderName: z.string().min(1, 'Account holder name is required'),
        accountNumber: z.string().min(1, 'Account number is required'),
        bankName: z.string().min(1, 'Bank name is required'),
        ifscCode: z.string().min(1, 'IFSC code is required'),
        accountType: z.enum(['savings', 'current'])
    })
});

const productCreateSchema = z.object({
    name: z.string().min(1, 'Product name is required').max(200),
    description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
    shortDescription: z.string().max(500).optional(),
    category: z.enum(['electronics', 'furniture', 'appliances', 'tools', 'sports', 'automotive', 'clothing', 'books', 'toys', 'other']),
    subcategory: z.string().optional(),
    tags: z.array(z.string()).optional(),
    specifications: z.object({
        brand: z.string().optional(),
        model: z.string().optional(),
        color: z.string().optional(),
        size: z.string().optional(),
        weight: z.string().optional(),
        condition: z.enum(['new', 'like_new', 'good', 'fair']).optional()
    }).optional(),
    pricing: z.object({
        daily: z.number().positive('Daily price must be positive'),
        weekly: z.number().positive().optional(),
        monthly: z.number().positive().optional(),
        deposit: z.object({
            amount: z.number().min(0),
            required: z.boolean()
        }).optional()
    }),
    inventory: z.object({
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        locationId: z.string().min(1, 'Location is required')
    }),
    rentalTerms: z.object({
        minRentalDays: z.number().int().min(1).optional(),
        maxRentalDays: z.number().int().optional(),
        advanceBookingDays: z.number().int().optional(),
        requiresApproval: z.boolean().optional()
    }).optional()
});

/**
 * @route   POST /api/provider/register
 * @desc    Register as a provider
 * @access  Private (Customer can upgrade to Provider)
 */
router.post('/register', async (req, res, next) => {
    try {
        const validation = providerRegistrationSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError('Invalid provider registration data', validation.error.errors);
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        if (user.role === 'provider') {
            throw new ValidationError('User is already a provider');
        }

        // Update user role and provider profile
        user.role = 'provider';
        user.providerProfile = {
            ...validation.data,
            verificationStatus: 'pending',
            isVerified: false
        };

        await user.save();

        logger.info(`User registered as provider: ${user.id}`);

        res.json({
            success: true,
            message: 'Provider registration successful. Your account is pending verification.',
            data: {
                user: {
                    id: user._id,
                    role: user.role,
                    providerProfile: user.providerProfile
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/provider/profile
 * @desc    Get provider profile
 * @access  Private (Provider)
 */
router.get('/profile', requireProvider, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('plan')
            .select('-password');

        res.json({
            success: true,
            data: { user }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/provider/profile
 * @desc    Update provider profile
 * @access  Private (Provider)
 */
router.put('/profile', requireProvider, async (req, res, next) => {
    try {
        const allowedUpdates = [
            'providerProfile.businessName',
            'providerProfile.businessType',
            'providerProfile.website',
            'providerProfile.description',
            'providerProfile.bankDetails',
            'providerProfile.autoApproveBookings',
            'providerProfile.allowInstantBooking'
        ];

        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/provider/products
 * @desc    Create a new product
 * @access  Private (Provider)
 */
router.post('/products', requireProvider, createUploadMiddleware('products', 'images', 10), async (req, res, next) => {
    try {
        const productData = JSON.parse(req.body.productData || '{}');
        const validation = productCreateSchema.safeParse(productData);

        if (!validation.success) {
            throw new ValidationError('Invalid product data', validation.error.errors);
        }

        const { name, description, shortDescription, category, subcategory, tags, specifications, pricing, inventory, rentalTerms } = validation.data;

        // Check if user has reached product limit based on plan
        const user = await User.findById(req.user.id).populate('plan');
        if (user.plan && user.plan.features.maxProducts > 0) {
            const currentProductCount = user.providerProfile.totalProducts || 0;
            if (currentProductCount >= user.plan.features.maxProducts) {
                throw new ValidationError(`You have reached your plan limit of ${user.plan.features.maxProducts} products`);
            }
        }

        // Verify location exists and is active
        const location = await Location.findById(inventory.locationId);
        if (!location || !location.isActive) {
            throw new NotFoundError('Location not found or not active');
        }

        // Generate slug from name
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check if slug already exists
        let uniqueSlug = slug;
        let counter = 1;
        while (await Product.findOne({ slug: uniqueSlug })) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        // Process uploaded images
        const images = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach((file, index) => {
                images.push({
                    url: file.path,
                    publicId: file.filename,
                    alt: `${name} image ${index + 1}`,
                    isPrimary: index === 0
                });
            });
        }

        // Create product
        const product = new Product({
            name,
            slug: uniqueSlug,
            description,
            shortDescription,
            category,
            subcategory,
            tags: tags || [],
            images,
            specifications: specifications || {},
            inventory: [{
                locationId: inventory.locationId,
                quantity: inventory.quantity,
                reserved: 0,
                minQuantity: 1,
                maxQuantity: inventory.quantity
            }],
            pricing: {
                basePrice: {
                    daily: pricing.daily,
                    weekly: pricing.weekly,
                    monthly: pricing.monthly
                },
                currency: 'INR',
                deposit: pricing.deposit || { amount: 0, required: false }
            },
            rentalTerms: {
                minRentalPeriod: {
                    value: rentalTerms?.minRentalDays || 1,
                    unit: 'day'
                },
                maxRentalPeriod: rentalTerms?.maxRentalDays ? {
                    value: rentalTerms.maxRentalDays,
                    unit: 'day'
                } : undefined,
                advanceBookingDays: rentalTerms?.advanceBookingDays || 30,
                requiresApproval: rentalTerms?.requiresApproval || false
            },
            status: 'active', // Providers can directly create active products
            isVisible: true,
            owner: req.user.id,
            createdBy: req.user.id
        });

        await product.save();

        // Update provider's product count
        await User.findByIdAndUpdate(req.user.id, {
            $inc: { 'providerProfile.totalProducts': 1 }
        });

        logger.info(`Product created by provider: ${product._id} by ${req.user.id}`);

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
 * @route   GET /api/provider/products
 * @desc    Get provider's products
 * @access  Private (Provider)
 */
router.get('/products', requireProvider, async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            category,
            search,
            sort = 'createdAt'
        } = req.query;

        const query = { owner: req.user.id };

        if (status) query.status = status;
        if (category) query.category = category;
        if (search) {
            query.$text = { $search: search };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortQuery = { [sort]: -1 };

        const [products, total] = await Promise.all([
            Product.find(query)
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
 * @route   GET /api/provider/products/:id
 * @desc    Get single product (provider's own)
 * @access  Private (Provider)
 */
router.get('/products/:id', requireProvider, async (req, res, next) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            owner: req.user.id
        }).populate('location');

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        res.json({
            success: true,
            data: { product }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/provider/products/:id
 * @desc    Update product
 * @access  Private (Provider)
 */
router.put('/products/:id', requireProvider, async (req, res, next) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        // Update product
        Object.assign(product, req.body);
        product.updatedBy = req.user.id;
        await product.save();

        logger.info(`Product updated by provider: ${req.params.id} by ${req.user.id}`);

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: { product }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/provider/products/:id
 * @desc    Delete product
 * @access  Private (Provider)
 */
router.delete('/products/:id', requireProvider, async (req, res, next) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        // Check if product has active bookings
        const activeBookings = await Booking.countDocuments({
            product: product._id,
            status: { $in: ['confirmed', 'approved', 'picked_up', 'in_use'] }
        });

        if (activeBookings > 0) {
            throw new ValidationError('Cannot delete product with active bookings');
        }

        // Soft delete by setting status to archived
        product.status = 'archived';
        product.isVisible = false;
        product.updatedBy = req.user.id;
        await product.save();

        // Update provider's product count
        await User.findByIdAndUpdate(req.user.id, {
            $inc: { 'providerProfile.totalProducts': -1 }
        });

        logger.info(`Product deleted by provider: ${req.params.id} by ${req.user.id}`);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/provider/bookings
 * @desc    Get provider's bookings
 * @access  Private (Provider)
 */
router.get('/bookings', requireProvider, async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            startDate,
            endDate
        } = req.query;

        // Get provider's products
        const providerProducts = await Product.find({ owner: req.user.id }).select('_id');
        const productIds = providerProducts.map(p => p._id);

        const query = { product: { $in: productIds } };

        if (status) query.status = status;
        if (startDate || endDate) {
            query.startDate = {};
            if (startDate) query.startDate.$gte = new Date(startDate);
            if (endDate) query.startDate.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [bookings, total] = await Promise.all([
            Booking.find(query)
                .populate('customer', 'firstName lastName email phone')
                .populate('product', 'name slug images')
                .populate('location', 'name address')
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

/**
 * @route   PATCH /api/provider/bookings/:id/status
 * @desc    Update booking status (provider can approve/reject)
 * @access  Private (Provider)
 */
router.patch('/bookings/:id/status', requireProvider, async (req, res, next) => {
    try {
        const { status, reason, notes } = req.body;
        const bookingId = req.params.id;

        const booking = await Booking.findById(bookingId)
            .populate('product')
            .populate('customer');

        if (!booking) {
            throw new NotFoundError('Booking not found');
        }

        // Check if provider owns the product
        if (booking.product.owner.toString() !== req.user.id) {
            throw new UnauthorizedError('You can only manage bookings for your own products');
        }

        // Providers can approve/reject pending bookings
        const allowedStatuses = ['approved', 'rejected'];
        if (!allowedStatuses.includes(status)) {
            throw new ValidationError('Invalid status for provider');
        }

        if (booking.status !== 'confirmed') {
            throw new ValidationError('Can only approve/reject confirmed bookings');
        }

        await booking.updateStatus(status, req.user.id, reason, notes);

        logger.info(`Booking status updated by provider: ${bookingId} -> ${status} by ${req.user.id}`);

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
 * @route   GET /api/provider/dashboard
 * @desc    Get provider dashboard data
 * @access  Private (Provider)
 */
router.get('/dashboard', requireProvider, async (req, res, next) => {
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
            default:
                startDate.setDate(endDate.getDate() - 30);
        }

        // Get provider's products
        const providerProducts = await Product.find({ owner: req.user.id }).select('_id');
        const productIds = providerProducts.map(p => p._id);

        const [
            productStats,
            bookingStats,
            recentBookings,
            topProducts
        ] = await Promise.all([
            // Product statistics
            Product.aggregate([
                { $match: { owner: new mongoose.Types.ObjectId(req.user.id) } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                        totalViews: { $sum: '$views' }
                    }
                }
            ]),

            // Booking statistics
            Booking.aggregate([
                {
                    $match: {
                        product: { $in: productIds },
                        createdAt: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalBookings: { $sum: 1 },
                        totalRevenue: { $sum: '$pricing.totalAmount' },
                        statusBreakdown: { $push: '$status' }
                    }
                }
            ]),

            // Recent bookings
            Booking.find({ product: { $in: productIds } })
                .populate('customer', 'firstName lastName')
                .populate('product', 'name slug')
                .sort({ createdAt: -1 })
                .limit(10)
                .lean(),

            // Top products by bookings
            Booking.aggregate([
                {
                    $match: {
                        product: { $in: productIds },
                        createdAt: { $gte: startDate }
                    }
                },
                { $group: { _id: '$product', bookings: { $sum: 1 }, revenue: { $sum: '$pricing.totalAmount' } } },
                { $sort: { bookings: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: '$product' }
            ])
        ]);

        const dashboard = {
            period,
            products: productStats[0] || { total: 0, active: 0, totalViews: 0 },
            bookings: bookingStats[0] || { totalBookings: 0, totalRevenue: 0, statusBreakdown: [] },
            recentBookings,
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

module.exports = router;