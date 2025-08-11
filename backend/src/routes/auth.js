const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const rateLimit = require('express-rate-limit');

const User = require('../models/User');
const { authenticate, optionalAuth, requireAdmin } = require('../middleware/auth');
const { ValidationError, UnauthorizedError, NotFoundError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { cache } = require('../config/redis');
const emailService = require('../services/emailService');

const router = express.Router();

// Rate limiting for auth endpoints
const isAuthRateLimitDisabled = process.env.DISABLE_AUTH_RATE_LIMIT === 'true'
  || process.env.DISABLE_RATE_LIMITING === 'true'
  || process.env.NODE_ENV === 'development';

const authLimiter = isAuthRateLimitDisabled
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5, // 5 attempts per window
      message: 'Too many authentication attempts, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });

const loginLimiter = isAuthRateLimitDisabled
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX) || 10, // 10 login attempts per window
      message: 'Too many login attempts, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });

// Validation schemas
const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    phone: z.string().optional(),
    dateOfBirth: z.string().datetime().optional(),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional()
});

const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
});

const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
});

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email format')
});

const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters')
});

// Helper functions
const generateTokens = (user) => {
    const payload = {
        userId: user._id,
        email: user.email,
        role: user.role
    };

    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });

    return { accessToken, refreshToken };
};

const validateInput = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            next(new ValidationError('Validation failed', error.errors));
        }
    };
};

// Routes

/**
 * @route   GET /api/auth/users
 * @desc    List users (admin only)
 * @access  Private (admin)
 */
router.get('/users', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.role) {
            filter.role = req.query.role;
        }
        if (typeof req.query.isActive !== 'undefined') {
            filter.isActive = req.query.isActive === 'true' || req.query.isActive === true;
        }
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            filter.$or = [
                { email: searchRegex },
                { firstName: searchRegex },
                { lastName: searchRegex },
                { phone: searchRegex },
            ];
        }

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password -twoFactorSecret -emailVerificationToken -passwordResetToken')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authLimiter, validateInput(registerSchema), async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, phone, dateOfBirth, gender } = req.body;

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            throw new ValidationError('User with this email already exists');
        }

        // Create new user
        const user = new User({
            email,
            password,
            firstName,
            lastName,
            phone,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            gender,
            metadata: {
                source: 'web'
            }
        });

        await user.save();

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user);

        // Store refresh token in Redis
        await cache.set(`refresh_token:${user._id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

        logger.info(`New user registered: ${email}`);

        // Fire-and-forget welcome email (do not block response)
        emailService.sendWelcomeEmail({ email, firstName, lastName }).catch(err => {
            logger.warn('Welcome email failed:', err.message);
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified
                },
                tokens: {
                    accessToken,
                    refreshToken
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginLimiter, validateInput(loginSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // Check if account is locked
        if (user.isLocked) {
            throw new UnauthorizedError('Account is temporarily locked due to too many failed login attempts');
        }

        // Check if account is active
        if (!user.isActive) {
            throw new UnauthorizedError('Account is deactivated');
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            await user.incLoginAttempts();
            throw new UnauthorizedError('Invalid credentials');
        }

        // Reset login attempts on successful login
        if (user.loginAttempts > 0) {
            await user.resetLoginAttempts();
        }

        // Update last login info
        user.lastLoginAt = new Date();
        user.lastLoginIP = req.ip;
        await user.save();

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user);

        // Store refresh token in Redis
        await cache.set(`refresh_token:${user._id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

        logger.info(`User logged in: ${email}`);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified
                },
                tokens: {
                    accessToken,
                    refreshToken
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', validateInput(refreshTokenSchema), async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Check if refresh token exists in Redis
        const storedToken = await cache.get(`refresh_token:${decoded.userId}`);
        if (!storedToken || storedToken !== refreshToken) {
            throw new UnauthorizedError('Invalid refresh token');
        }

        // Find user
        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) {
            throw new UnauthorizedError('User not found or inactive');
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

        // Update refresh token in Redis
        await cache.set(`refresh_token:${user._id}`, newRefreshToken, 7 * 24 * 60 * 60); // 7 days

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                tokens: {
                    accessToken,
                    refreshToken: newRefreshToken
                }
            }
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            next(new UnauthorizedError('Invalid refresh token'));
        } else {
            next(error);
        }
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const token = req.token;

        // Remove refresh token from Redis
        await cache.del(`refresh_token:${userId}`);

        // Blacklist the current access token
        const decoded = jwt.decode(token);
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        if (expiresIn > 0) {
            await cache.set(`blacklist:${token}`, true, expiresIn);
        }

        logger.info(`User logged out: ${req.user.email}`);

        res.json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('plan', 'name features')
            .select('-password');

        if (!user) {
            throw new NotFoundError('User not found');
        }

        res.json({
            success: true,
            data: {
                user
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, async (req, res, next) => {
    try {
        const allowedUpdates = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'gender', 'preferences'];
        const updates = {};

        // Filter allowed updates
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Clear user cache
        await cache.del(`user:${user._id}`);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', authenticate, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            throw new ValidationError('Current password and new password are required');
        }

        if (newPassword.length < 8) {
            throw new ValidationError('New password must be at least 8 characters');
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            throw new UnauthorizedError('Current password is incorrect');
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Clear user cache
        await cache.del(`user:${user._id}`);

        logger.info(`Password changed for user: ${user.email}`);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;