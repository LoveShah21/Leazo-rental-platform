const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['warehouse', 'store', 'pickup_point', 'delivery_hub'],
        required: true
    },

    // Address information
    address: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true,
            default: 'India'
        },
        postalCode: {
            type: String,
            required: true
        },
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },

    // Contact information
    contact: {
        phone: String,
        email: String,
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },

    // Operating hours
    operatingHours: {
        monday: { open: String, close: String, closed: { type: Boolean, default: false } },
        tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
        wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
        thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
        friday: { open: String, close: String, closed: { type: Boolean, default: false } },
        saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
        sunday: { open: String, close: String, closed: { type: Boolean, default: true } }
    },

    // Shiprocket integration
    shiprocket: {
        pickupLocationId: String,
        isDefault: {
            type: Boolean,
            default: false
        }
    },

    // Status and settings
    isActive: {
        type: Boolean,
        default: true
    },
    allowPickup: {
        type: Boolean,
        default: true
    },
    allowDelivery: {
        type: Boolean,
        default: true
    },

    // Capacity and limits
    capacity: {
        maxItems: Number,
        maxWeight: Number, // in kg
        maxVolume: Number  // in cubic meters
    },

    // Metadata
    metadata: {
        timezone: {
            type: String,
            default: 'Asia/Kolkata'
        },
        tags: [String],
        notes: String
    }
}, {
    timestamps: true
});

// Indexes (code already has unique: true, so no need for separate index)
locationSchema.index({ type: 1, isActive: 1 });
locationSchema.index({ 'address.city': 1, 'address.state': 1 });
locationSchema.index({ 'address.postalCode': 1 });
locationSchema.index({ 'shiprocket.pickupLocationId': 1 });

// Virtual for full address
locationSchema.virtual('fullAddress').get(function () {
    return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.postalCode}, ${this.address.country}`;
});

// Instance method to check if location is open
locationSchema.methods.isOpenAt = function (dateTime = new Date()) {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dateTime.getDay()];
    const daySchedule = this.operatingHours[dayName];

    if (daySchedule.closed) return false;

    const currentTime = dateTime.toTimeString().slice(0, 5); // HH:MM format
    return currentTime >= daySchedule.open && currentTime <= daySchedule.close;
};

// Static method to find active locations
locationSchema.statics.findActive = function () {
    return this.find({ isActive: true });
};

// Static method to find by city
locationSchema.statics.findByCity = function (city) {
    return this.find({
        'address.city': new RegExp(city, 'i'),
        isActive: true
    });
};

module.exports = mongoose.model('Location', locationSchema);