const express = require('express');
const { z } = require('zod');

const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const { authenticate, optionalAuth, requireStaff } = require('../middleware/auth');
const { ValidationError, NotFoundError, UnauthorizedError } = require('../middleware/errorHandler');
const { createUploadMiddleware } = require('../config/cloudinary');
const logger = require('../utils/logger');

const router = express.Router();

// Validation schemas
const createReviewSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    bookingId: z.string().min(1, 'Booking ID is required'),
    rating: z.number().int().min(1).max(5),
    title: z.string().max(100).optional(),
    comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000)
});

const voteSchema = z.object({
    vote: z.enum(['up', 'down'])
});

const reportSchema = z.object({
    reason: z.enum(['spam', 'inappropriate', 'fake', 'offensive', 'other']),
    comment: z.string().max(500).optional()
});

const moderateSchema = z.object({
    status: z.enum(['approved', 'rejected', 'flagged']),
    reason: z.string().optional(),
    notes: z.string().optional()
});

const responseSchema = z.object({
    comment: z.string().min(1, 'Response comment is required').max(1000)
});

/**
 * @route   POST /api/reviews
 * @desc    Create a review
 * @access  Private
 */
router.post('/', authenticate, createUploadMiddleware('reviews', 'images', 5), async (req, res, next) => {
    try {
        const reviewData = JSON.parse(req.body.reviewData || '{}');
        const validation = createReviewSchema.safeParse(reviewData);

        if (!validation.success) {
            throw new ValidationError('Invalid review data', validation.error.errors);
        }

        const { productId, bookingId, rating, title, comment } = validation.data;

        // Verify booking exists and belongs to user
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            throw new NotFoundError('Booking not found');
        }

        if (booking.customer.toString() !== req.user.id) {
            throw new UnauthorizedError('You can only review your own bookings');
        }

        if (booking.status !== 'completed') {
            throw new ValidationError('You can only review completed bookings');
        }

        // Check if review already exists
        const existingReview = await Review.findOne({
            customer: req.user.id,
            booking: bookingId
        });

        if (existingReview) {
            throw new ValidationError('You have already reviewed this booking');
        }

        // Verify product matches booking
        if (booking.product.toString() !== productId) {
            throw new ValidationError('Product ID does not match booking');
        }

        // Process uploaded images
        const images = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach((file, index) => {
                images.push({
                    url: file.path,
                    publicId: file.filename,
                    caption: `Review image ${index + 1}`
                });
            });
        }

        // Create review
        const review = new Review({
            rating,
            title,
            comment,
            product: productId,
            customer: req.user.id,
            booking: bookingId,
            images,
            metadata: {
                source: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'web',
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            }
        });

        await review.save();

        logger.info(`Review created: ${review._id} by user ${req.user.id}`);

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: {
                review: {
                    id: review._id,
                    rating: review.rating,
                    title: review.title,
                    comment: review.comment,
                    status: review.status,
                    createdAt: review.createdAt
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/reviews
 * @desc    Get reviews (with filters)
 * @access  Public
 */
router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const {
            productId,
            customerId,
            rating,
            status = 'approved',
            page = 1,
            limit = 20,
            sort = 'createdAt'
        } = req.query;

        const query = { status };

        if (productId) query.product = productId;
        if (customerId) query.customer = customerId;
        if (rating) query.rating = parseInt(rating);

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortQuery = sort === 'helpful' ? { 'helpfulVotes.up': -1 } : { [sort]: -1 };

        const [reviews, total] = await Promise.all([
            Review.find(query)
                .populate('customer', 'firstName lastName avatar')
                .populate('product', 'name slug')
                .sort(sortQuery)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Review.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                reviews,
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
 * @route   GET /api/reviews/:id
 * @desc    Get single review
 * @access  Public
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('customer', 'firstName lastName avatar')
            .populate('product', 'name slug images')
            .populate('response.respondedBy', 'firstName lastName');

        if (!review) {
            throw new NotFoundError('Review not found');
        }

        // Only show approved reviews to non-staff users
        if (review.status !== 'approved' &&
            (!req.user || !['staff', 'manager', 'admin', 'super_admin'].includes(req.user.role))) {
            throw new NotFoundError('Review not found');
        }

        res.json({
            success: true,
            data: { review }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/reviews/product/:productId
 * @desc    Get reviews for a specific product
 * @access  Public
 */
router.get('/product/:productId', optionalAuth, async (req, res, next) => {
    try {
        const {
            rating,
            page = 1,
            limit = 20,
            sort = 'createdAt'
        } = req.query;

        const productId = req.params.productId;

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            throw new NotFoundError('Product not found');
        }

        const query = { product: productId, status: 'approved' };
        if (rating) query.rating = parseInt(rating);

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortQuery = sort === 'helpful' ? { 'helpfulVotes.up': -1 } : { [sort]: -1 };

        const [reviews, total, stats] = await Promise.all([
            Review.find(query)
                .populate('customer', 'firstName lastName avatar')
                .sort(sortQuery)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Review.countDocuments(query),
            Review.getProductStats(productId)
        ]);

        res.json({
            success: true,
            data: {
                reviews,
                stats,
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
 * @route   POST /api/reviews/:id/vote
 * @desc    Vote on review helpfulness
 * @access  Private
 */
router.post('/:id/vote', authenticate, async (req, res, next) => {
    try {
        const validation = voteSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError('Invalid vote data', validation.error.errors);
        }

        const { vote } = validation.data;
        const reviewId = req.params.id;

        const review = await Review.findById(reviewId);
        if (!review) {
            throw new NotFoundError('Review not found');
        }

        if (review.status !== 'approved') {
            throw new ValidationError('Cannot vote on non-approved reviews');
        }

        // Users cannot vote on their own reviews
        if (review.customer.toString() === req.user.id) {
            throw new ValidationError('You cannot vote on your own review');
        }

        await review.voteHelpful(req.user.id, vote);

        logger.info(`Review vote: ${reviewId} voted ${vote} by ${req.user.id}`);

        res.json({
            success: true,
            message: 'Vote recorded successfully',
            data: {
                helpfulVotes: {
                    up: review.helpfulVotes.up,
                    down: review.helpfulVotes.down,
                    total: review.totalVotes,
                    percentage: review.helpfulPercentage
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/reviews/:id/report
 * @desc    Report a review
 * @access  Private
 */
router.post('/:id/report', authenticate, async (req, res, next) => {
    try {
        const validation = reportSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError('Invalid report data', validation.error.errors);
        }

        const { reason, comment } = validation.data;
        const reviewId = req.params.id;

        const review = await Review.findById(reviewId);
        if (!review) {
            throw new NotFoundError('Review not found');
        }

        // Check if user already reported this review
        const existingReport = review.reports.find(
            report => report.reportedBy.toString() === req.user.id
        );

        if (existingReport) {
            throw new ValidationError('You have already reported this review');
        }

        await review.addReport(req.user.id, reason, comment);

        logger.info(`Review reported: ${reviewId} by ${req.user.id} for ${reason}`);

        res.json({
            success: true,
            message: 'Review reported successfully'
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/reviews/:id/moderate
 * @desc    Moderate a review (approve/reject/flag)
 * @access  Staff
 */
router.patch('/:id/moderate', authenticate, requireStaff, async (req, res, next) => {
    try {
        const validation = moderateSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError('Invalid moderation data', validation.error.errors);
        }

        const { status, reason, notes } = validation.data;
        const reviewId = req.params.id;

        const review = await Review.findById(reviewId);
        if (!review) {
            throw new NotFoundError('Review not found');
        }

        await review.moderate(req.user.id, status, reason, notes);

        logger.info(`Review moderated: ${reviewId} -> ${status} by ${req.user.id}`);

        res.json({
            success: true,
            message: 'Review moderated successfully',
            data: {
                review: {
                    id: review._id,
                    status: review.status,
                    moderatedAt: review.moderation.moderatedAt
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/reviews/:id/response
 * @desc    Add business response to review
 * @access  Staff
 */
router.post('/:id/response', authenticate, requireStaff, async (req, res, next) => {
    try {
        const validation = responseSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError('Invalid response data', validation.error.errors);
        }

        const { comment } = validation.data;
        const reviewId = req.params.id;

        const review = await Review.findById(reviewId);
        if (!review) {
            throw new NotFoundError('Review not found');
        }

        if (review.status !== 'approved') {
            throw new ValidationError('Can only respond to approved reviews');
        }

        await review.addResponse(req.user.id, comment);

        logger.info(`Review response added: ${reviewId} by ${req.user.id}`);

        res.json({
            success: true,
            message: 'Response added successfully',
            data: {
                response: {
                    comment: review.response.comment,
                    respondedAt: review.response.respondedAt
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/reviews/admin/pending
 * @desc    Get reviews pending moderation
 * @access  Staff
 */
router.get('/admin/pending', authenticate, requireStaff, async (req, res, next) => {
    try {
        const { limit = 50 } = req.query;

        const reviews = await Review.findPendingModeration(parseInt(limit));

        res.json({
            success: true,
            data: { reviews }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/reviews/stats/overview
 * @desc    Get review statistics
 * @access  Staff
 */
router.get('/stats/overview', authenticate, requireStaff, async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        const matchStage = {};
        if (startDate || endDate) {
            matchStage.createdAt = {};
            if (startDate) matchStage.createdAt.$gte = new Date(startDate);
            if (endDate) matchStage.createdAt.$lte = new Date(endDate);
        }

        const stats = await Review.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: '$rating' },
                    statusBreakdown: {
                        $push: '$status'
                    },
                    ratingDistribution: {
                        $push: '$rating'
                    },
                    verifiedReviews: {
                        $sum: { $cond: ['$isVerified', 1, 0] }
                    }
                }
            }
        ]);

        const result = stats[0] || {
            totalReviews: 0,
            averageRating: 0,
            statusBreakdown: [],
            ratingDistribution: [],
            verifiedReviews: 0
        };

        // Process status breakdown
        const statusCounts = {};
        result.statusBreakdown.forEach(status => {
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        // Process rating distribution
        const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        result.ratingDistribution.forEach(rating => {
            ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
        });

        res.json({
            success: true,
            data: {
                stats: {
                    totalReviews: result.totalReviews,
                    averageRating: Math.round(result.averageRating * 10) / 10,
                    verifiedReviews: result.verifiedReviews,
                    verificationRate: result.totalReviews > 0 ?
                        Math.round((result.verifiedReviews / result.totalReviews) * 100) : 0,
                    statusBreakdown: statusCounts,
                    ratingDistribution: ratingCounts
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;