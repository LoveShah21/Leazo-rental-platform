const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
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
        maxlength: 2000
    },
    shortDescription: {
        type: String,
        maxlength: 500
    },

    // Product categorization
    category: {
        type: String,
        required: true,
        enum: [
            'electronics',
            'furniture',
            'appliances',
            'tools',
            'sports',
            'automotive',
            'clothing',
            'books',
            'toys',
            'other'
        ]
    },
    subcategory: String,
    tags: [String],

    // Media
    images: [{
        url: String,
        alt: String,
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    videos: [{
        url: String,
        title: String,
        thumbnail: String
    }],

    // Specifications
    specifications: {
        brand: String,
        model: String,
        color: String,
        size: String,
        weight: String,
        dimensions: {
            length: Number,
            width: Number,
            height: Number,
            unit: {
                type: String,
                enum: ['cm', 'inch', 'm'],
                default: 'cm'
            }
        },
        material: String,
        condition: {
            type: String,
            enum: ['new', 'like_new', 'good', 'fair'],
            default: 'good'
        },
        yearOfManufacture: Number,
        customFields: [{
            name: String,
            value: String,
            type: {
                type: String,
                enum: ['text', 'number', 'boolean', 'date'],
                default: 'text'
            }
        }]
    },

    // Inventory and availability
    inventory: [{
        locationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        },
        reserved: {
            type: Number,
            default: 0,
            min: 0
        },
        minQuantity: {
            type: Number,
            default: 1
        },
        maxQuantity: {
            type: Number,
            default: null
        }
    }],

    // Pricing
    pricing: {
        basePrice: {
            hourly: Number,
            daily: {
                type: Number,
                required: true
            },
            weekly: Number,
            monthly: Number
        },
        currency: {
            type: String,
            default: 'USD'
        },
        deposit: {
            amount: Number,
            required: {
                type: Boolean,
                default: false
            }
        },
        lateFees: {
            enabled: {
                type: Boolean,
                default: true
            },
            amount: Number,
            type: {
                type: String,
                enum: ['fixed', 'percentage'],
                default: 'fixed'
            },
            gracePeriod: {
                type: Number,
                default: 24 // hours
            }
        }
    },

    // Rental terms
    rentalTerms: {
        minRentalPeriod: {
            value: {
                type: Number,
                default: 1
            },
            unit: {
                type: String,
                enum: ['hour', 'day', 'week', 'month'],
                default: 'day'
            }
        },
        maxRentalPeriod: {
            value: Number,
            unit: {
                type: String,
                enum: ['hour', 'day', 'week', 'month'],
                default: 'day'
            }
        },
        advanceBookingDays: {
            type: Number,
            default: 30
        },
        cancellationPolicy: {
            type: String,
            enum: ['flexible', 'moderate', 'strict'],
            default: 'moderate'
        },
        requiresApproval: {
            type: Boolean,
            default: false
        }
    },

    // Green/Sustainability scoring
    greenScore: {
        score: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        criteria: [{
            name: String,
            score: Number,
            weight: Number,
            description: String
        }],
        verifications: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            score: Number,
            comment: String,
            proof: [String], // URLs to proof images/documents
            verifiedAt: {
                type: Date,
                default: Date.now
            }
        }],
        lastUpdated: Date,
        provider: String,
        providerNotes: String
    },

    // Reviews and ratings
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        },
        distribution: {
            1: { type: Number, default: 0 },
            2: { type: Number, default: 0 },
            3: { type: Number, default: 0 },
            4: { type: Number, default: 0 },
            5: { type: Number, default: 0 }
        }
    },

    // Related products
    relatedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],

    // SEO and metadata
    seo: {
        metaTitle: String,
        metaDescription: String,
        keywords: [String]
    },

    // Status and visibility
    status: {
        type: String,
        enum: ['draft', 'active', 'inactive', 'archived'],
        default: 'draft'
    },
    isVisible: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },

    // Tracking
    views: {
        type: Number,
        default: 0
    },
    bookings: {
        type: Number,
        default: 0
    },

    // Ownership and management
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance (slug already has unique: true, so no need for separate index)
productSchema.index({ category: 1, status: 1 });
productSchema.index({ status: 1, isVisible: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ 'pricing.basePrice.daily': 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ 'greenScore.score': -1 });
productSchema.index({ isFeatured: -1, createdAt: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ updatedAt: -1 });

// Compound indexes for availability queries
productSchema.index({ 'inventory.locationId': 1, status: 1 });

// Text search index
productSchema.index({
    name: 'text',
    description: 'text',
    shortDescription: 'text',
    tags: 'text',
    'specifications.brand': 'text',
    'specifications.model': 'text'
});

// Virtual for total inventory across all locations
productSchema.virtual('totalInventory').get(function () {
    return this.inventory.reduce((total, inv) => total + inv.quantity, 0);
});

// Virtual for available inventory across all locations
productSchema.virtual('availableInventory').get(function () {
    return this.inventory.reduce((total, inv) => total + (inv.quantity - inv.reserved), 0);
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function () {
    const primary = this.images.find(img => img.isPrimary);
    return primary || this.images[0] || null;
});

// Virtual for price range
productSchema.virtual('priceRange').get(function () {
    const prices = [];
    if (this.pricing.basePrice.hourly) prices.push(this.pricing.basePrice.hourly);
    if (this.pricing.basePrice.daily) prices.push(this.pricing.basePrice.daily);
    if (this.pricing.basePrice.weekly) prices.push(this.pricing.basePrice.weekly);
    if (this.pricing.basePrice.monthly) prices.push(this.pricing.basePrice.monthly);

    if (prices.length === 0) return null;

    return {
        min: Math.min(...prices),
        max: Math.max(...prices)
    };
});

// Pre-save middleware to ensure only one primary image
productSchema.pre('save', function (next) {
    if (this.isModified('images')) {
        const primaryImages = this.images.filter(img => img.isPrimary);
        if (primaryImages.length > 1) {
            // Keep only the first primary image
            this.images.forEach((img, index) => {
                if (index > 0 && img.isPrimary) {
                    img.isPrimary = false;
                }
            });
        } else if (primaryImages.length === 0 && this.images.length > 0) {
            // Set first image as primary if none is set
            this.images[0].isPrimary = true;
        }
    }
    next();
});

// Pre-save middleware to update green score timestamp
productSchema.pre('save', function (next) {
    if (this.isModified('greenScore.score') || this.isModified('greenScore.criteria')) {
        this.greenScore.lastUpdated = new Date();
    }
    next();
});

// Instance method to check availability at a location
productSchema.methods.getAvailabilityAtLocation = function (locationId) {
    const inventory = this.inventory.find(inv =>
        inv.locationId.toString() === locationId.toString()
    );

    if (!inventory) return 0;

    return Math.max(0, inventory.quantity - inventory.reserved);
};

// Instance method to reserve inventory
productSchema.methods.reserveInventory = async function (locationId, quantity) {
    const inventory = this.inventory.find(inv =>
        inv.locationId.toString() === locationId.toString()
    );

    if (!inventory) {
        throw new Error('Product not available at this location');
    }

    if (inventory.quantity - inventory.reserved < quantity) {
        throw new Error('Insufficient inventory available');
    }

    inventory.reserved += quantity;
    return this.save();
};

// Instance method to release reserved inventory
productSchema.methods.releaseInventory = async function (locationId, quantity) {
    const inventory = this.inventory.find(inv =>
        inv.locationId.toString() === locationId.toString()
    );

    if (!inventory) {
        throw new Error('Product not found at this location');
    }

    inventory.reserved = Math.max(0, inventory.reserved - quantity);
    return this.save();
};

// Instance method to update rating
productSchema.methods.updateRating = async function (newRating, oldRating = null) {
    if (oldRating) {
        // Remove old rating
        this.rating.distribution[oldRating]--;
        this.rating.count--;
    }

    // Add new rating
    this.rating.distribution[newRating]++;
    this.rating.count++;

    // Recalculate average
    let totalScore = 0;
    for (let i = 1; i <= 5; i++) {
        totalScore += i * this.rating.distribution[i];
    }

    this.rating.average = this.rating.count > 0 ? totalScore / this.rating.count : 0;

    return this.save();
};

// Static method to find available products
productSchema.statics.findAvailable = function (locationId = null) {
    const query = { status: 'active', isVisible: true };

    if (locationId) {
        query['inventory.locationId'] = locationId;
        query['$expr'] = {
            $gt: [
                { $subtract: ['$inventory.quantity', '$inventory.reserved'] },
                0
            ]
        };
    }

    return this.find(query);
};

// Static method to search products
productSchema.statics.search = function (searchTerm, filters = {}) {
    const query = { status: 'active', isVisible: true };

    if (searchTerm) {
        query.$text = { $search: searchTerm };
    }

    if (filters.category) {
        query.category = filters.category;
    }

    if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
    }

    if (filters.minPrice || filters.maxPrice) {
        const priceQuery = {};
        if (filters.minPrice) priceQuery.$gte = filters.minPrice;
        if (filters.maxPrice) priceQuery.$lte = filters.maxPrice;
        query['pricing.basePrice.daily'] = priceQuery;
    }

    if (filters.locationId) {
        query['inventory.locationId'] = filters.locationId;
    }

    return this.find(query);
};

module.exports = mongoose.model('Product', productSchema);