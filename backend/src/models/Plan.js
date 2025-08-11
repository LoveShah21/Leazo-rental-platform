const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 500
    },

    // Plan type
    type: {
        type: String,
        enum: ['free', 'basic', 'premium', 'enterprise'],
        required: true
    },

    // Pricing
    pricing: {
        monthly: {
            type: Number,
            required: true,
            min: 0
        },
        yearly: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: 'INR'
        }
    },

    // Features and limits
    features: {
        // Product listing limits
        maxProducts: {
            type: Number,
            default: 0 // 0 means unlimited
        },
        maxImages: {
            type: Number,
            default: 5
        },

        // Booking limits
        maxBookingsPerMonth: {
            type: Number,
            default: 0 // 0 means unlimited
        },

        // Commission rates
        commission: {
            percentage: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            fixedAmount: {
                type: Number,
                default: 0,
                min: 0
            }
        },

        // Feature flags
        prioritySupport: {
            type: Boolean,
            default: false
        },
        analytics: {
            type: Boolean,
            default: false
        },
        customBranding: {
            type: Boolean,
            default: false
        },
        bulkUpload: {
            type: Boolean,
            default: false
        },
        advancedReporting: {
            type: Boolean,
            default: false
        },
        apiAccess: {
            type: Boolean,
            default: false
        },
        multiLocation: {
            type: Boolean,
            default: false
        },

        // Storage limits
        storageLimit: {
            type: Number, // in MB
            default: 100
        }
    },

    // Trial settings
    trial: {
        enabled: {
            type: Boolean,
            default: false
        },
        durationDays: {
            type: Number,
            default: 14
        }
    },

    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    isVisible: {
        type: Boolean,
        default: true
    },

    // Display order
    sortOrder: {
        type: Number,
        default: 0
    },

    // Metadata
    metadata: {
        color: String, // For UI display
        icon: String,
        badge: String, // e.g., "Most Popular"
        tags: [String]
    }
}, {
    timestamps: true
});

// Indexes (slug already has unique: true, so no need for separate index)
planSchema.index({ type: 1, isActive: 1 });
planSchema.index({ sortOrder: 1, isActive: 1 });

// Virtual for monthly savings when paying yearly
planSchema.virtual('yearlySavings').get(function () {
    const monthlyTotal = this.pricing.monthly * 12;
    return monthlyTotal - this.pricing.yearly;
});

// Virtual for savings percentage
planSchema.virtual('savingsPercentage').get(function () {
    const monthlyTotal = this.pricing.monthly * 12;
    if (monthlyTotal === 0) return 0;
    return Math.round(((monthlyTotal - this.pricing.yearly) / monthlyTotal) * 100);
});

// Static method to get active plans
planSchema.statics.getActivePlans = function () {
    return this.find({ isActive: true, isVisible: true }).sort({ sortOrder: 1 });
};

// Static method to get plan by slug
planSchema.statics.findBySlug = function (slug) {
    return this.findOne({ slug, isActive: true });
};

// Instance method to check if user can perform action based on plan limits
planSchema.methods.canPerformAction = function (action, currentUsage = 0) {
    switch (action) {
        case 'add_product':
            return this.features.maxProducts === 0 || currentUsage < this.features.maxProducts;
        case 'add_booking':
            return this.features.maxBookingsPerMonth === 0 || currentUsage < this.features.maxBookingsPerMonth;
        default:
            return true;
    }
};

// Instance method to calculate commission
planSchema.methods.calculateCommission = function (amount) {
    const { percentage, fixedAmount } = this.features.commission;
    const percentageCommission = (amount * percentage) / 100;
    return percentageCommission + fixedAmount;
};

module.exports = mongoose.model('Plan', planSchema);