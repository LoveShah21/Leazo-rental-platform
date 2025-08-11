const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    // Reference to booking
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },

    // Customer information
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Payment details
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        required: true,
        default: 'INR'
    },

    // Payment method and gateway
    gateway: {
        type: String,
        enum: ['stripe', 'razorpay', 'cash', 'bank_transfer'],
        required: true
    },
    method: {
        type: String,
        enum: ['card', 'upi', 'netbanking', 'wallet', 'cash', 'bank_transfer'],
        required: true
    },

    // Payment status
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
        default: 'pending'
    },

    // Gateway-specific data
    gatewayData: {
        // Stripe
        paymentIntentId: String,
        paymentMethodId: String,
        clientSecret: String,

        // Razorpay
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String,

        // Common
        transactionId: String,
        gatewayOrderId: String,
        gatewayResponse: mongoose.Schema.Types.Mixed
    },

    // Payment breakdown
    breakdown: {
        baseAmount: {
            type: Number,
            required: true
        },
        taxes: {
            type: Number,
            default: 0
        },
        fees: {
            type: Number,
            default: 0
        },
        discount: {
            type: Number,
            default: 0
        },
        deposit: {
            type: Number,
            default: 0
        }
    },

    // Timestamps
    initiatedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date,
    failedAt: Date,
    refundedAt: Date,

    // Refund information
    refund: {
        amount: Number,
        reason: String,
        refundId: String,
        refundedAt: Date,
        refundedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },

    // Failure information
    failure: {
        code: String,
        message: String,
        details: mongoose.Schema.Types.Mixed
    },

    // Invoice information
    invoice: {
        number: String,
        url: String,
        generatedAt: Date
    },

    // Metadata
    metadata: {
        userAgent: String,
        ipAddress: String,
        source: {
            type: String,
            enum: ['web', 'mobile', 'admin'],
            default: 'web'
        },
        notes: String
    },

    // Webhook tracking
    webhooks: [{
        event: String,
        receivedAt: Date,
        processed: Boolean,
        data: mongoose.Schema.Types.Mixed
    }]
}, {
    timestamps: true
});

// Indexes
paymentSchema.index({ booking: 1 });
paymentSchema.index({ customer: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ gateway: 1, status: 1 });
paymentSchema.index({ 'gatewayData.paymentIntentId': 1 });
paymentSchema.index({ 'gatewayData.razorpayOrderId': 1 });
paymentSchema.index({ 'gatewayData.transactionId': 1 });
paymentSchema.index({ 'invoice.number': 1 });

// Virtual for total amount
paymentSchema.virtual('totalAmount').get(function () {
    return this.breakdown.baseAmount + this.breakdown.taxes + this.breakdown.fees - this.breakdown.discount;
});

// Virtual for refunded amount
paymentSchema.virtual('refundedAmount').get(function () {
    return this.refund?.amount || 0;
});

// Virtual for net amount (after refunds)
paymentSchema.virtual('netAmount').get(function () {
    return this.amount - this.refundedAmount;
});

// Pre-save middleware to generate invoice number
paymentSchema.pre('save', async function (next) {
    if (this.status === 'completed' && !this.invoice.number) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');

        // Find the last invoice number for this month
        const lastPayment = await this.constructor.findOne({
            'invoice.number': new RegExp(`^INV${year}${month}`)
        }).sort({ 'invoice.number': -1 });

        let sequence = 1;
        if (lastPayment && lastPayment.invoice.number) {
            const lastSequence = parseInt(lastPayment.invoice.number.slice(-6));
            sequence = lastSequence + 1;
        }

        this.invoice.number = `INV${year}${month}${sequence.toString().padStart(6, '0')}`;
        this.invoice.generatedAt = new Date();
    }
    next();
});

// Instance method to mark as completed
paymentSchema.methods.markCompleted = async function (transactionId, gatewayResponse = null) {
    this.status = 'completed';
    this.completedAt = new Date();
    this.gatewayData.transactionId = transactionId;
    if (gatewayResponse) {
        this.gatewayData.gatewayResponse = gatewayResponse;
    }
    return this.save();
};

// Instance method to mark as failed
paymentSchema.methods.markFailed = async function (errorCode, errorMessage, details = null) {
    this.status = 'failed';
    this.failedAt = new Date();
    this.failure = {
        code: errorCode,
        message: errorMessage,
        details: details
    };
    return this.save();
};

// Instance method to process refund
paymentSchema.methods.processRefund = async function (amount, reason, refundedBy, refundId = null) {
    if (this.status !== 'completed') {
        throw new Error('Can only refund completed payments');
    }

    const maxRefundAmount = this.amount - this.refundedAmount;
    if (amount > maxRefundAmount) {
        throw new Error(`Cannot refund more than ${maxRefundAmount}`);
    }

    this.refund = {
        amount: (this.refund?.amount || 0) + amount,
        reason: reason,
        refundId: refundId,
        refundedAt: new Date(),
        refundedBy: refundedBy
    };

    // Update status
    if (this.refund.amount >= this.amount) {
        this.status = 'refunded';
    } else {
        this.status = 'partially_refunded';
    }

    this.refundedAt = new Date();
    return this.save();
};

// Instance method to add webhook event
paymentSchema.methods.addWebhookEvent = async function (event, data) {
    this.webhooks.push({
        event: event,
        receivedAt: new Date(),
        processed: false,
        data: data
    });
    return this.save();
};

// Static method to find by gateway order ID
paymentSchema.statics.findByGatewayOrderId = function (gatewayOrderId) {
    return this.findOne({
        $or: [
            { 'gatewayData.paymentIntentId': gatewayOrderId },
            { 'gatewayData.razorpayOrderId': gatewayOrderId },
            { 'gatewayData.gatewayOrderId': gatewayOrderId }
        ]
    });
};

// Static method to get payment statistics
paymentSchema.statics.getStatistics = async function (startDate = null, endDate = null) {
    const matchStage = { status: 'completed' };

    if (startDate || endDate) {
        matchStage.completedAt = {};
        if (startDate) matchStage.completedAt.$gte = startDate;
        if (endDate) matchStage.completedAt.$lte = endDate;
    }

    const stats = await this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalPayments: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
                averageAmount: { $avg: '$amount' },
                gatewayBreakdown: {
                    $push: '$gateway'
                }
            }
        }
    ]);

    return stats[0] || {
        totalPayments: 0,
        totalAmount: 0,
        averageAmount: 0,
        gatewayBreakdown: []
    };
};

module.exports = mongoose.model('Payment', paymentSchema);