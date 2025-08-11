const express = require('express');
const { z } = require('zod');
const Product = require('../models/Product');
const { authenticate, optionalAuth, requireStaff } = require('../middleware/auth');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

const router = express.Router();

// Validation schemas
const productSearchSchema = z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    tags: z.string().optional(),
    minPrice: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
    maxPrice: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
    locationId: z.string().optional(),
    sort: z.enum(['name', 'price', 'rating', 'created', 'popular']).optional(),
    page: z.string().transform(val => parseInt(val) || 1).optional(),
    limit: z.string().transform(val => Math.min(parseInt(val) || 20, 100)).optional()
});

/**
 * @route   GET /api/products
 * @desc    Get products with search and filters
 * @access  Public
 */
router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const validation = productSearchSchema.safeParse(req.query);
        if (!validation.success) {
            throw new ValidationError('Invalid query parameters', validation.error.errors);
        }

        const {
            search,
            category,
            tags,
            minPrice,
            maxPrice,
            locationId,
            sort = 'created',
            page = 1,
            limit = 20
        } = validation.data;

        // Build cache key
        const cacheKey = `products:${JSON.stringify(req.query)}`;

        // Try to get from cache first
        const cachedResult = await cache.get(cacheKey);
        if (cachedResult) {
            return res.json({
                success: true,
                data: cachedResult,
                cached: true
            });
        }

        // Build query
        const query = { status: 'active', isVisible: true };

        if (search) {
            query.$text = { $search: search };
        }

        if (category) {
            query.category = category;
        }

        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            query.tags = { $in: tagArray };
        }

        if (minPrice || maxPrice) {
            query['pricing.basePrice.daily'] = {};
            if (minPrice) query['pricing.basePrice.daily'].$gte = minPrice;
            if (maxPrice) query['pricing.basePrice.daily'].$lte = maxPrice;
        }

        if (locationId) {
            query['inventory.locationId'] = locationId;
            query['$expr'] = {
                $gt: [
                    { $subtract: ['$inventory.quantity', '$inventory.reserved'] },
                    0
                ]
            };
        }

        // Build sort
        let sortQuery = {};
        switch (sort) {
            case 'name':
                sortQuery = { name: 1 };
                break;
            case 'price':
                sortQuery = { 'pricing.basePrice.daily': 1 };
                break;
            case 'rating':
                sortQuery = { 'rating.average': -1 };
                break;
            case 'popular':
                sortQuery = { bookings: -1, views: -1 };
                break;
            default:
                sortQuery = { createdAt: -1 };
        }

        // Execute query with pagination
        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('owner', 'firstName lastName')
                .select('-inventory -createdBy -updatedBy')
                .sort(sortQuery)
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(query)
        ]);

        const result = {
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        };

        // Cache for 5 minutes
        await cache.set(cacheKey, result, 300);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
    try {
        const productId = req.params.id;

        // Try cache first
        const cacheKey = `product:${productId}`;
        const cachedProduct = await cache.get(cacheKey);

        if (cachedProduct) {
            // Increment view count asynchronously
            Product.findByIdAndUpdate(productId, { $inc: { views: 1 } }).exec();

            return res.json({
                success: true,
                data: { product: cachedProduct },
                cached: true
            });
        }

        const product = await Product.findById(productId)
            .populate('owner', 'firstName lastName email')
            .populate('relatedProducts', 'name slug images pricing.basePrice rating')
            .lean();

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        if (product.status !== 'active' || !product.isVisible) {
            // Only allow staff to view inactive products
            if (!req.user || !['staff', 'manager', 'admin', 'super_admin'].includes(req.user.role)) {
                throw new NotFoundError('Product not found');
            }
        }

        // Cache for 10 minutes
        await cache.set(cacheKey, product, 600);

        // Increment view count asynchronously
        Product.findByIdAndUpdate(productId, { $inc: { views: 1 } }).exec();

        res.json({
            success: true,
            data: { product }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/products/:id/related
 * @desc    Get related products
 * @access  Public
 */
router.get('/:id/related', async (req, res, next) => {
    try {
        const productId = req.params.id;
        const limit = Math.min(parseInt(req.query.limit) || 6, 20);

        const product = await Product.findById(productId).select('category tags relatedProducts');

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        // Try cache first
        const cacheKey = `related:${productId}:${limit}`;
        const cachedRelated = await cache.get(cacheKey);

        if (cachedRelated) {
            return res.json({
                success: true,
                data: { products: cachedRelated },
                cached: true
            });
        }

        let relatedProducts = [];

        // First, get manually set related products
        if (product.relatedProducts && product.relatedProducts.length > 0) {
            relatedProducts = await Product.find({
                _id: { $in: product.relatedProducts },
                status: 'active',
                isVisible: true
            })
                .select('name slug images pricing.basePrice rating')
                .limit(limit)
                .lean();
        }

        // If we need more products, find by category and tags
        if (relatedProducts.length < limit) {
            const remaining = limit - relatedProducts.length;
            const excludeIds = [productId, ...relatedProducts.map(p => p._id)];

            const additionalProducts = await Product.find({
                _id: { $nin: excludeIds },
                $or: [
                    { category: product.category },
                    { tags: { $in: product.tags || [] } }
                ],
                status: 'active',
                isVisible: true
            })
                .select('name slug images pricing.basePrice rating')
                .sort({ 'rating.average': -1, bookings: -1 })
                .limit(remaining)
                .lean();

            relatedProducts = [...relatedProducts, ...additionalProducts];
        }

        // Cache for 30 minutes
        await cache.set(cacheKey, relatedProducts, 1800);

        res.json({
            success: true,
            data: { products: relatedProducts }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/products/categories
 * @desc    Get product categories with counts
 * @access  Public
 */
router.get('/meta/categories', async (req, res, next) => {
    try {
        const cacheKey = 'product:categories';
        const cachedCategories = await cache.get(cacheKey);

        if (cachedCategories) {
            return res.json({
                success: true,
                data: { categories: cachedCategories },
                cached: true
            });
        }

        const categories = await Product.aggregate([
            {
                $match: { status: 'active', isVisible: true }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const formattedCategories = categories.map(cat => ({
            name: cat._id,
            count: cat.count
        }));

        // Cache for 1 hour
        await cache.set(cacheKey, formattedCategories, 3600);

        res.json({
            success: true,
            data: { categories: formattedCategories }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/products/meta/tags
 * @desc    Get popular product tags
 * @access  Public
 */
router.get('/meta/tags', async (req, res, next) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);

        const cacheKey = `product:tags:${limit}`;
        const cachedTags = await cache.get(cacheKey);

        if (cachedTags) {
            return res.json({
                success: true,
                data: { tags: cachedTags },
                cached: true
            });
        }

        const tags = await Product.aggregate([
            {
                $match: { status: 'active', isVisible: true }
            },
            {
                $unwind: '$tags'
            },
            {
                $group: {
                    _id: '$tags',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: limit
            }
        ]);

        const formattedTags = tags.map(tag => ({
            name: tag._id,
            count: tag.count
        }));

        // Cache for 1 hour
        await cache.set(cacheKey, formattedTags, 3600);

        res.json({
            success: true,
            data: { tags: formattedTags }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;