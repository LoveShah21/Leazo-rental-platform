const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingNumber: {
        type: String,
        required: true,
        unique: true
    },

    // Customer information
    customer: {
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

    // Rental period
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    actualStartDate: Date,
    actualEndDate: Date,

    // Status tracking
    status: {
        type: String,
        enum: [
            'pending',      // Initial state, awaiting payment
            'confirmed',    // Payment received, booking confirmed
            'approved',     // Admin approved (if required)
            'rejected',     // Admin rejected
            'picked_up',    // Customer picked up the item
            'in_use',       // Item is currently with customer
            'returned',     // Item returned by customer
            'completed',    // Booking completed successfully
            'cancelled',    // Cancelled by customer or admin
            'overdue',      // Item not returned on time
            'disputed'      // Dispute raised
        ],
        default: 'pending'
    },

    // Pricing breakdown
    pricing: {
        baseAmount: {
            type: Number,
            required: true
        },
        deposit: {
            type: Number,
            default: 0
        },
        taxes: {
            type: Number,
            default: 0
        },
        fees: {
            type: Number,
            default: 0
        },
        discounts: {
            type: Number,
            default: 0
        },
        lateFees: {
            type: Number,
            default: 0
        },
        totalAmount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: 'USD'
        }
    },

    // Payment information
    payment: {
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
            default: 'pending'
        },
        method: {
            type: String,
            enum: ['stripe', 'razorpay', 'cash', 'bank_transfer'],
            required: true
        },
        transactionId: String,
        paymentIntentId: String,
        paidAt: Date,
        refundedAt: Date,
        refundAmount: Number
    },

    // Delivery information
    delivery: {
        type: {
            type: String,
            enum: ['pickup', 'delivery', 'both'],
            default: 'pickup'
        },
        pickupAddress: {
            street: String,
            city: String,
            state: String,
            country: String,
            postalCode: String,
            coordinates: {
                latitude: Number,
                longitude: Number
            }
        },
        deliveryAddress: {
            street: String,
            city: String,
            state: String,
            country: String,
            postalCode: String,
            coordinates: {
                latitude: Number,
                longitude: Number
            }
        },
        instructions: String,
        contactPerson: {
            name: String,
            phone: String,
            email: String
        }
    },

    // Shipment tracking (Shiprocket integration)
    shipment: {
        outbound: {
            shiprocketOrderId: String,
            shiprocketShipmentId: String,
            awbCode: String,
            courierName: String,
            trackingUrl: String,
            status: String,
            estimatedDelivery: Date,
            actualDelivery: Date,
            pickupScheduled: Date,
            pickupCompleted: Date
        },
        inbound: {
            shiprocketOrderId: String,
            shiprocketShipmentId: String,
            awbCode: String,
            courierName: String,
            trackingUrl: String,
            status: String,
            estimatedDelivery: Date,
            actualDelivery: Date,
            pickupScheduled: Date,
            pickupCompleted: Date
        }
    },

    // Terms and conditions
    terms: {
        cancellationPolicy: String,
        lateFeePolicy: String,
        damagePolicy: String,
        acceptedAt: Date,
        acceptedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },

    // Additional information
    notes: {
        customer: String,
        internal: String,
        pickup: String,
        return: String
    },

    // Attachments and documents
    documents: [{
        type: {
            type: String,
            enum: ['contract', 'invoice', 'receipt', 'damage_report', 'other']
        },
        name: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],

    // Damage and condition tracking
    condition: {
        beforeRental: {
            photos: [String],
            notes: String,
            checkedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            checkedAt: Date
        },
        afterRental: {
            photos: [String],
            notes: String,
            damages: [{
                description: String,
                severity: {
                    type: String,
                    enum: ['minor', 'moderate', 'major']
                },
                cost: Number,
                photos: [String]
            }],
            checkedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            checkedAt: Date
        }
    },

    // Review and rating
    review: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String,
        photos: [String],
        submittedAt: Date
    },

    // Metadata
    metadata: {
        source: {
            type: String,
            enum: ['web', 'mobile', 'admin', 'api'],
            default: 'web'
        },
        userAgent: String,
        ipAddress: String,
        referrer: String
    },

    // Audit trail
    statusHistory: [{
        status: String,
        changedAt: {
            type: Date,
            default: Date.now
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: String,
        notes: String
    }],

    // System fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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

// Indexes for performance (bookingNumber already has unique: true, so no need for separate index)
bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ product: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ location: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ startDate: 1, endDate: 1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ 'shipment.outbound.awbCode': 1 });
bookingSchema.index({ 'shipment.inbound.awbCode': 1 });

// Compound indexes for availability queries
bookingSchema.index({ product: 1, location: 1, startDate: 1, endDate: 1, status: 1 });

// Virtual for rental duration in days
bookingSchema.virtual('rentalDuration').get(function () {
    if (!this.startDate || !this.endDate) return 0;
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for actual rental duration
bookingSchema.virtual('actualRentalDuration').get(function () {
    if (!this.actualStartDate || !this.actualEndDate) return 0;
    const diffTime = Math.abs(this.actualEndDate - this.actualStartDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
bookingSchema.virtual('isOverdue').get(function () {
    if (this.status === 'completed' || this.status === 'returned' || this.status === 'cancelled') {
        return false;
    }
    return new Date() > this.endDate;
});

// Virtual for days overdue
bookingSchema.virtual('daysOverdue').get(function () {
    if (!this.isOverdue) return 0;
    const diffTime = Math.abs(new Date() - this.endDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for total amount due (including late fees)
bookingSchema.virtual('totalAmountDue').get(function () {
    return this.pricing.totalAmount + this.pricing.lateFees;
});

// Pre-save middleware to generate booking number
bookingSchema.pre('save', async function (next) {
    if (this.isNew && !this.bookingNumber) {
        try {
            const date = new Date();
            const year = date.getFullYear().toString().slice(-2);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');

            // Find the last booking number for today with retry logic
            let sequence = 1;
            let attempts = 0;
            const maxAttempts = 5;

            while (attempts < maxAttempts) {
                try {
                    const lastBooking = await this.constructor.findOne({
                        bookingNumber: new RegExp(`^BK${year}${month}${day}`)
                    }).sort({ bookingNumber: -1 }).lean();

                    if (lastBooking) {
                        const lastSequence = parseInt(lastBooking.bookingNumber.slice(-4));
                        sequence = lastSequence + 1;
                    }

                    this.bookingNumber = `BK${year}${month}${day}${sequence.toString().padStart(4, '0')}`;
                    break;
                } catch (error) {
                    attempts++;
                    if (attempts >= maxAttempts) {
                        // Fallback to timestamp-based booking number
                        const timestamp = Date.now().toString().slice(-6);
                        this.bookingNumber = `BK${year}${month}${day}${timestamp}`;
                        break;
                    }
                    // Wait a bit before retrying
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            }
        } catch (error) {
            // Ultimate fallback
            const timestamp = Date.now().toString().slice(-8);
            this.bookingNumber = `BK${timestamp}`;
        }
    }
    next();
});

// Pre-save middleware to track status changes
bookingSchema.pre('save', function (next) {
    if (this.isModified('status') && !this.isNew) {
        this.statusHistory.push({
            status: this.status,
            changedAt: new Date(),
            changedBy: this.updatedBy
        });
    }
    next();
});

// Instance method to check if booking overlaps with given dates
bookingSchema.methods.overlaps = function (startDate, endDate) {
    return (
        (this.startDate <= endDate && this.endDate >= startDate) &&
        ['confirmed', 'approved', 'picked_up', 'in_use'].includes(this.status)
    );
};

// Instance method to calculate late fees
bookingSchema.methods.calculateLateFees = function (lateFeeConfig) {
    if (!this.isOverdue || !lateFeeConfig.enabled) return 0;

    const daysOverdue = this.daysOverdue;
    const gracePeriodHours = lateFeeConfig.gracePeriod || 24;
    const hoursOverdue = Math.max(0, (new Date() - this.endDate) / (1000 * 60 * 60) - gracePeriodHours);

    if (hoursOverdue <= 0) return 0;

    if (lateFeeConfig.type === 'percentage') {
        return (this.pricing.baseAmount * lateFeeConfig.amount / 100) * Math.ceil(hoursOverdue / 24);
    } else {
        return lateFeeConfig.amount * Math.ceil(hoursOverdue / 24);
    }
};

// Instance method to update status with history
bookingSchema.methods.updateStatus = async function (newStatus, changedBy, reason = null, notes = null) {
    const oldStatus = this.status;
    this.status = newStatus;
    this.updatedBy = changedBy;

    this.statusHistory.push({
        status: newStatus,
        changedAt: new Date(),
        changedBy: changedBy,
        reason: reason,
        notes: notes
    });

    return this.save();
};

// Static method to generate booking number
bookingSchema.statics.generateBookingNumber = async function () {
    try {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        // Find the last booking number for today
        const lastBooking = await this.findOne({
            bookingNumber: new RegExp(`^BK${year}${month}${day}`)
        }).sort({ bookingNumber: -1 }).lean();

        let sequence = 1;
        if (lastBooking) {
            const lastSequence = parseInt(lastBooking.bookingNumber.slice(-4));
            sequence = lastSequence + 1;
        }

        return `BK${year}${month}${day}${sequence.toString().padStart(4, '0')}`;
    } catch (error) {
        // Fallback to timestamp-based booking number
        const timestamp = Date.now().toString().slice(-8);
        return `BK${timestamp}`;
    }
};

// Static method to find overlapping bookings
bookingSchema.statics.findOverlapping = function (productId, locationId, startDate, endDate, excludeBookingId = null) {
    const query = {
        product: productId,
        location: locationId,
        status: { $in: ['confirmed', 'approved', 'picked_up', 'in_use'] },
        $or: [
            {
                startDate: { $lte: endDate },
                endDate: { $gte: startDate }
            }
        ]
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    return this.find(query);
};

// Static method to find bookings by status
bookingSchema.statics.findByStatus = function (status, limit = null) {
    const query = this.find({ status });
    if (limit) query.limit(limit);
    return query.sort({ createdAt: -1 });
};

// Static method to find overdue bookings
bookingSchema.statics.findOverdue = function () {
    return this.find({
        status: { $in: ['confirmed', 'approved', 'picked_up', 'in_use'] },
        endDate: { $lt: new Date() }
    });
};

// Static method to get booking statistics
bookingSchema.statics.getStatistics = async function (startDate = null, endDate = null) {
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
                totalBookings: { $sum: 1 },
                totalRevenue: { $sum: '$pricing.totalAmount' },
                averageBookingValue: { $avg: '$pricing.totalAmount' },
                statusBreakdown: {
                    $push: '$status'
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalBookings: 1,
                totalRevenue: 1,
                averageBookingValue: 1,
                statusBreakdown: 1
            }
        }
    ]);

    return stats[0] || {
        totalBookings: 0,
        totalRevenue: 0,
        averageBookingValue: 0,
        statusBreakdown: []
    };
};

module.exports = mongoose.model('Booking', bookingSchema);