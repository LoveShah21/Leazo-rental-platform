const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    // Review details
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        trim: true,
        maxlength: 100
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },

    // References
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },

    // Media attachments
    images: [{
        url: String,
        publicId: String, // Cloudinary public ID
        caption: String
    }],

    // Review status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'flagged'],
        default: 'pending'
    },

    // Verification
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedPurchase: {
        type: Boolean,
        default: false
    },

    // Moderation
    moderation: {
        moderatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        moderatedAt: Date,
        reason: String,
        notes: String
    },

    // Helpful votes
    helpfulVotes: {
        up: {
            type: Number,
            default: 0
        },
        down: {
            type: Number,
            default: 0
        },
        voters: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            vote: {
                type: String,
                enum: ['up', 'down']
            },
            votedAt: {
                type: Date,
                default: Date.now
            }
        }]
    },

    // Response from business
    response: {
        comment: String,
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        respondedAt: Date
    },

    // Reporting and flags
    reports: [{
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: {
            type: String,
            enum: ['spam', 'inappropriate', 'fake', 'offensive', 'other']
        },
        comment: String,
        reportedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Metadata
    metadata: {
        source: {
            type: String,
            enum: ['web', 'mobile', 'email'],
            default: 'web'
        },
        ipAddress: String,
        userAgent: String,
        language: {
            type: String,
            default: 'en'
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
reviewSchema.index({ customer: 1, createdAt: -1 });
reviewSchema.index({ booking: 1 });
reviewSchema.index({ rating: 1, status: 1 });
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ isVerified: 1, status: 1 });

// Compound index for preventing duplicate reviews
reviewSchema.index({ customer: 1, booking: 1 }, { unique: true });

// Virtual for helpful score
reviewSchema.virtual('helpfulScore').get(function () {
    return this.helpfulVotes.up - this.helpfulVotes.down;
});

// Virtual for total votes
reviewSchema.virtual('totalVotes').get(function () {
    return this.helpfulVotes.up + this.helpfulVotes.down;
});

// Virtual for helpful percentage
reviewSchema.virtual('helpfulPercentage').get(function () {
    const total = this.totalVotes;
    return total > 0 ? Math.round((this.helpfulVotes.up / total) * 100) : 0;
});

// Pre-save middleware to set verification status
reviewSchema.pre('save', async function (next) {
    if (this.isNew && this.booking) {
        // Check if the booking is completed to mark as verified purchase
        const Booking = mongoose.model('Booking');
        const booking = await Booking.findById(this.booking);

        if (booking && booking.status === 'completed') {
            this.verifiedPurchase = true;
            this.isVerified = true;
        }
    }
    next();
});

// Post-save middleware to update product rating
reviewSchema.post('save', async function (doc) {
    if (doc.status === 'approved') {
        await doc.updateProductRating();
    }
});

// Post-remove middleware to update product rating
reviewSchema.post('remove', async function (doc) {
    await doc.updateProductRating();
});

// Instance method to update product rating
reviewSchema.methods.updateProductRating = async function () {
    const Product = mongoose.model('Product');

    const stats = await mongoose.model('Review').aggregate([
        {
            $match: {
                product: this.product,
                status: 'approved'
            }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
                ratingDistribution: {
                    $push: '$rating'
                }
            }
        }
    ]);

    if (stats.length > 0) {
        const stat = stats[0];
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        stat.ratingDistribution.forEach(rating => {
            distribution[rating]++;
        });

        await Product.findByIdAndUpdate(this.product, {
            'rating.average': Math.round(stat.averageRating * 10) / 10,
            'rating.count': stat.totalReviews,
            'rating.distribution': distribution
        });
    } else {
        // No reviews, reset rating
        await Product.findByIdAndUpdate(this.product, {
            'rating.average': 0,
            'rating.count': 0,
            'rating.distribution': { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        });
    }
};

// Instance method to vote helpful
reviewSchema.methods.voteHelpful = async function (userId, voteType) {
    // Remove existing vote from this user
    this.helpfulVotes.voters = this.helpfulVotes.voters.filter(
        voter => voter.user.toString() !== userId.toString()
    );

    // Add new vote
    this.helpfulVotes.voters.push({
        user: userId,
        vote: voteType,
        votedAt: new Date()
    });

    // Recalculate vote counts
    const upVotes = this.helpfulVotes.voters.filter(v => v.vote === 'up').length;
    const downVotes = this.helpfulVotes.voters.filter(v => v.vote === 'down').length;

    this.helpfulVotes.up = upVotes;
    this.helpfulVotes.down = downVotes;

    return this.save();
};

// Instance method to add report
reviewSchema.methods.addReport = async function (reportedBy, reason, comment = null) {
    this.reports.push({
        reportedBy: reportedBy,
        reason: reason,
        comment: comment,
        reportedAt: new Date()
    });

    // Auto-flag if multiple reports
    if (this.reports.length >= 3 && this.status === 'approved') {
        this.status = 'flagged';
    }

    return this.save();
};

// Instance method to moderate
reviewSchema.methods.moderate = async function (moderatorId, status, reason = null, notes = null) {
    this.status = status;
    this.moderation = {
        moderatedBy: moderatorId,
        moderatedAt: new Date(),
        reason: reason,
        notes: notes
    };

    return this.save();
};

// Instance method to add business response
reviewSchema.methods.addResponse = async function (responderId, comment) {
    this.response = {
        comment: comment,
        respondedBy: responderId,
        respondedAt: new Date()
    };

    return this.save();
};

// Static method to find by product
reviewSchema.statics.findByProduct = function (productId, status = 'approved', limit = 20, skip = 0) {
    return this.find({ product: productId, status: status })
        .populate('customer', 'firstName lastName avatar')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
};

// Static method to get review statistics
reviewSchema.statics.getProductStats = async function (productId) {
    const stats = await this.aggregate([
        {
            $match: {
                product: mongoose.Types.ObjectId(productId),
                status: 'approved'
            }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
                ratingDistribution: {
                    $push: '$rating'
                }
            }
        }
    ]);

    if (stats.length === 0) {
        return {
            averageRating: 0,
            totalReviews: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
    }

    const stat = stats[0];
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    stat.ratingDistribution.forEach(rating => {
        distribution[rating]++;
    });

    return {
        averageRating: Math.round(stat.averageRating * 10) / 10,
        totalReviews: stat.totalReviews,
        distribution: distribution
    };
};

// Static method to find reviews needing moderation
reviewSchema.statics.findPendingModeration = function (limit = 50) {
    return this.find({
        $or: [
            { status: 'pending' },
            { status: 'flagged' }
        ]
    })
        .populate('customer', 'firstName lastName email')
        .populate('product', 'name slug')
        .sort({ createdAt: -1 })
        .limit(limit);
};

module.exports = mongoose.model('Review', reviewSchema);