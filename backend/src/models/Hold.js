const mongoose = require('mongoose');

const holdSchema = new mongoose.Schema({
    // User who created the hold
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Product and location
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },

    // Hold period
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },

    // Hold status
    status: {
        type: String,
        enum: ['active', 'expired', 'converted', 'cancelled'],
        default: 'active'
    },

    // Expiration (TTL)
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 } // TTL index
    },

    // Session information for tracking
    sessionId: String,
    userAgent: String,
    ipAddress: String,

    // Conversion tracking
    convertedToBooking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    convertedAt: Date,

    // Cancellation tracking
    cancelledAt: Date,
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    cancellationReason: String,

    // Metadata
    metadata: {
        source: {
            type: String,
            enum: ['web', 'mobile', 'api'],
            default: 'web'
        },
        cartId: String,
        referrer: String
    }
}, {
    timestamps: true
});

// Indexes for performance
holdSchema.index({ user: 1, createdAt: -1 });
holdSchema.index({ product: 1, location: 1, startDate: 1, endDate: 1, status: 1 });
holdSchema.index({ status: 1, expiresAt: 1 });
holdSchema.index({ sessionId: 1 });
// expiresAt already has TTL index defined in schema, no need for separate index

// Virtual for hold duration in minutes
holdSchema.virtual('holdDuration').get(function () {
    if (!this.createdAt || !this.expiresAt) return 0;
    const diffTime = Math.abs(this.expiresAt - this.createdAt);
    return Math.ceil(diffTime / (1000 * 60));
});

// Virtual for remaining time in minutes
holdSchema.virtual('remainingTime').get(function () {
    if (this.status !== 'active') return 0;
    const now = new Date();
    if (now >= this.expiresAt) return 0;
    const diffTime = this.expiresAt - now;
    return Math.ceil(diffTime / (1000 * 60));
});

// Virtual for is expired
holdSchema.virtual('isExpired').get(function () {
    return new Date() >= this.expiresAt;
});

// Pre-save middleware to set expiration time
holdSchema.pre('save', function (next) {
    if (this.isNew && !this.expiresAt) {
        // Default hold duration is 10 minutes
        const holdDurationMinutes = parseInt(process.env.HOLD_DURATION_MINUTES) || 10;
        this.expiresAt = new Date(Date.now() + holdDurationMinutes * 60 * 1000);
    }
    next();
});

// Instance method to extend hold
holdSchema.methods.extend = async function (additionalMinutes = 10) {
    if (this.status !== 'active') {
        throw new Error('Cannot extend inactive hold');
    }

    const maxExtensionMinutes = parseInt(process.env.MAX_HOLD_EXTENSION_MINUTES) || 30;
    const currentDuration = this.holdDuration;

    if (currentDuration + additionalMinutes > maxExtensionMinutes) {
        throw new Error(`Hold cannot be extended beyond ${maxExtensionMinutes} minutes`);
    }

    this.expiresAt = new Date(this.expiresAt.getTime() + additionalMinutes * 60 * 1000);
    return this.save();
};

// Instance method to convert to booking
holdSchema.methods.convertToBooking = async function (bookingId) {
    if (this.status !== 'active') {
        throw new Error('Cannot convert inactive hold');
    }

    this.status = 'converted';
    this.convertedToBooking = bookingId;
    this.convertedAt = new Date();

    return this.save();
};

// Instance method to cancel hold
holdSchema.methods.cancel = async function (cancelledBy = null, reason = null) {
    if (this.status !== 'active') {
        throw new Error('Cannot cancel inactive hold');
    }

    this.status = 'cancelled';
    this.cancelledAt = new Date();
    this.cancelledBy = cancelledBy;
    this.cancellationReason = reason;

    return this.save();
};

// Static method to find active holds for a product/location/date range
holdSchema.statics.findActiveHolds = function (productId, locationId, startDate, endDate) {
    return this.find({
        product: productId,
        location: locationId,
        status: 'active',
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
        expiresAt: { $gt: new Date() }
    });
};

// Static method to find holds by user
holdSchema.statics.findByUser = function (userId, status = null) {
    const query = { user: userId };
    if (status) query.status = status;
    return this.find(query).sort({ createdAt: -1 });
};

// Static method to find expired holds
holdSchema.statics.findExpired = function () {
    return this.find({
        status: 'active',
        expiresAt: { $lte: new Date() }
    });
};

// Static method to cleanup expired holds
holdSchema.statics.cleanupExpired = async function () {
    const expiredHolds = await this.find({
        status: 'active',
        expiresAt: { $lte: new Date() }
    });

    const updatePromises = expiredHolds.map(hold => {
        hold.status = 'expired';
        return hold.save();
    });

    await Promise.all(updatePromises);
    return expiredHolds.length;
};

// Static method to get hold statistics
holdSchema.statics.getStatistics = async function (startDate = null, endDate = null) {
    const matchStage = {};

    if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = startDate;
        if (endDate) matchStage.createdAt.$lte = endDate;
    }

    const stats = await this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalQuantity: { $sum: '$quantity' }
            }
        }
    ]);

    const result = {
        active: 0,
        expired: 0,
        converted: 0,
        cancelled: 0,
        totalQuantity: 0
    };

    stats.forEach(stat => {
        result[stat._id] = stat.count;
        result.totalQuantity += stat.totalQuantity;
    });

    return result;
};

// Static method to calculate conversion rate
holdSchema.statics.getConversionRate = async function (startDate = null, endDate = null) {
    const matchStage = {};

    if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = startDate;
        if (endDate) matchStage.createdAt.$lte = endDate;
    }

    const stats = await this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalHolds: { $sum: 1 },
                convertedHolds: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'converted'] }, 1, 0]
                    }
                }
            }
        }
    ]);

    if (!stats.length || stats[0].totalHolds === 0) {
        return 0;
    }

    return (stats[0].convertedHolds / stats[0].totalHolds) * 100;
};

module.exports = mongoose.model('Hold', holdSchema);