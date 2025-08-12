const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // User who receives the notification
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Notification type and category
  type: {
    type: String,
    enum: ['info', 'warning', 'error', 'success'],
    required: true
  },

  category: {
    type: String,
    enum: ['late_fee', 'low_stock', 'payment', 'booking', 'system', 'security', 'user'],
    required: true
  },

  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },

  // Notification content
  title: {
    type: String,
    required: true,
    maxlength: 200
  },

  message: {
    type: String,
    required: true,
    maxlength: 1000
  },

  // Action details
  actionUrl: {
    type: String,
    maxlength: 500
  },

  actionText: {
    type: String,
    maxlength: 50
  },

  // Read status
  read: {
    type: Boolean,
    default: false,
    index: true
  },

  // Metadata for additional context
  metadata: {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: Number,
    daysOverdue: Number,
    stockLevel: Number,
    failedCount: Number,
    errorCount: Number,
    timeWindow: String,
    // Additional flexible metadata
    [String]: mongoose.Schema.Types.Mixed
  },

  // Delivery tracking
  delivery: {
    email: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      failed: {
        type: Boolean,
        default: false
      },
      failureReason: String
    },
    sms: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      failed: {
        type: Boolean,
        default: false
      },
      failureReason: String
    },
    push: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      failed: {
        type: Boolean,
        default: false
      },
      failureReason: String
    }
  },

  // Expiration and cleanup
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 } // TTL index - notifications expire after 90 days
  },

  // Source information
  source: {
    type: String,
    enum: ['system', 'manual', 'webhook', 'scheduled'],
    default: 'system'
  },

  // Audit trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Tags for filtering and organization
  tags: [String],

  // System fields
  system: {
    processed: {
      type: Boolean,
      default: false
    },
    processedAt: Date,
    retryCount: {
      type: Number,
      default: 0
    },
    maxRetries: {
      type: Number,
      default: 3
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      // Remove sensitive fields from JSON output
      delete ret.__v;
      return ret;
    }
  }
});

// Set default expiration to 90 days from creation
notificationSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
  }
  next();
});

// Indexes for performance
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ user: 1, category: 1, createdAt: -1 });
notificationSchema.index({ user: 1, priority: 1, createdAt: -1 });
notificationSchema.index({ category: 1, priority: 1, createdAt: -1 });
notificationSchema.index({ 'metadata.bookingId': 1 });
notificationSchema.index({ 'metadata.productId': 1 });
notificationSchema.index({ source: 1, createdAt: -1 });

// Virtual for unread count (for aggregation queries)
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Static methods
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ user: userId, read: false });
};

notificationSchema.statics.getUnreadCountByCategory = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId), read: false } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

notificationSchema.statics.getUnreadCountByPriority = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId), read: false } },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

// Instance methods
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  return this.save();
};

notificationSchema.methods.markAsUnread = function() {
  this.read = false;
  return this.save();
};

notificationSchema.methods.isHighPriority = function() {
  return this.priority === 'high' || this.priority === 'critical';
};

notificationSchema.methods.requiresImmediateAttention = function() {
  return this.priority === 'critical' || 
         (this.category === 'late_fee' && this.priority === 'high') ||
         (this.category === 'system' && this.priority === 'high');
};

// Middleware for cleanup
notificationSchema.pre('find', function() {
  // Automatically filter out expired notifications
  this.where('expiresAt').gt(new Date());
});

notificationSchema.pre('findOne', function() {
  this.where('expiresAt').gt(new Date());
});

// Export the model
module.exports = mongoose.model('Notification', notificationSchema);

