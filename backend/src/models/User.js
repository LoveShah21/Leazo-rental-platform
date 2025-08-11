const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    phone: {
        type: String,
        trim: true,
        match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
    },
    role: {
        type: String,
        enum: ['customer', 'provider', 'staff', 'manager', 'admin', 'super_admin'],
        default: 'customer'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: String,
        default: null
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer_not_to_say']
    },

    // Address information
    addresses: [{
        type: {
            type: String,
            enum: ['home', 'work', 'other'],
            default: 'home'
        },
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,
        isDefault: {
            type: Boolean,
            default: false
        }
    }],

    // Subscription and plan information
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        default: null
    },
    planStartDate: Date,
    planEndDate: Date,
    planStatus: {
        type: String,
        enum: ['active', 'expired', 'cancelled', 'trial'],
        default: null
    },

    // Provider-specific information
    providerProfile: {
        businessName: String,
        businessType: {
            type: String,
            enum: ['individual', 'business', 'company'],
            default: 'individual'
        },
        businessRegistrationNumber: String,
        taxId: String,
        website: String,
        description: String,

        // Verification status
        isVerified: {
            type: Boolean,
            default: false
        },
        verificationStatus: {
            type: String,
            enum: ['pending', 'in_review', 'verified', 'rejected'],
            default: 'pending'
        },
        verificationDocuments: [{
            type: String,
            url: String,
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }],
        verifiedAt: Date,
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },

        // Business metrics
        totalProducts: {
            type: Number,
            default: 0
        },
        totalBookings: {
            type: Number,
            default: 0
        },
        totalRevenue: {
            type: Number,
            default: 0
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },

        // Bank details for payouts
        bankDetails: {
            accountHolderName: String,
            accountNumber: String,
            bankName: String,
            ifscCode: String,
            accountType: {
                type: String,
                enum: ['savings', 'current']
            }
        },

        // Settings
        autoApproveBookings: {
            type: Boolean,
            default: false
        },
        allowInstantBooking: {
            type: Boolean,
            default: true
        }
    },

    // Preferences
    preferences: {
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            sms: {
                type: Boolean,
                default: false
            },
            push: {
                type: Boolean,
                default: true
            }
        },
        language: {
            type: String,
            default: 'en'
        },
        currency: {
            type: String,
            default: 'USD'
        },
        timezone: {
            type: String,
            default: 'UTC'
        }
    },

    // Security
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: String,
    lastLoginAt: Date,
    lastLoginIP: String,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,

    // Verification tokens
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Metadata
    metadata: {
        source: {
            type: String,
            enum: ['web', 'mobile', 'admin'],
            default: 'web'
        },
        referralCode: String,
        referredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        tags: [String]
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.twoFactorSecret;
            delete ret.emailVerificationToken;
            delete ret.passwordResetToken;
            return ret;
        }
    }
});

// Indexes (email already has unique: true, so no need for separate index)
userSchema.index({ role: 1 });
userSchema.index({ plan: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'metadata.referralCode': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for account locked status
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Pre-save middleware to ensure only one default address
userSchema.pre('save', function (next) {
    if (this.isModified('addresses')) {
        const defaultAddresses = this.addresses.filter(addr => addr.isDefault);
        if (defaultAddresses.length > 1) {
            // Keep only the first default address
            this.addresses.forEach((addr, index) => {
                if (index > 0 && addr.isDefault) {
                    addr.isDefault = false;
                }
            });
        }
    }
    next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function () {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };

    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }

    return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

// Instance method to generate referral code
userSchema.methods.generateReferralCode = function () {
    if (!this.metadata.referralCode) {
        this.metadata.referralCode = this._id.toString().substring(0, 8).toUpperCase();
    }
    return this.metadata.referralCode;
};

// Static method to find by email
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActive = function () {
    return this.find({ isActive: true });
};

// Static method to find by role
userSchema.statics.findByRole = function (role) {
    return this.find({ role, isActive: true });
};

module.exports = mongoose.model('User', userSchema);