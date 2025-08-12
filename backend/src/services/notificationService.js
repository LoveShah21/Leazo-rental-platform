const Notification = require('../models/Notification');
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const User = require('../models/User');
const logger = require('../utils/logger');
const { queues } = require('../config/queue');

class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(data) {
    try {
      const notification = new Notification({
        user: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        category: data.category,
        priority: data.priority,
        actionUrl: data.actionUrl,
        actionText: data.actionText,
        metadata: data.metadata,
        read: false
      });

      await notification.save();
      
      // Emit real-time notification
      this.emitNotification(notification);
      
      logger.info('Notification created', { notificationId: notification._id, type: data.type });
      
      return notification;
    } catch (error) {
      logger.error('Failed to create notification', { error: error.message, data });
      throw error;
    }
  }

  /**
   * Check for late fees and create notifications
   */
  async checkLateFees() {
    try {
      const overdueBookings = await Booking.find({
        status: 'active',
        endDate: { $lt: new Date() },
        'payment.lateFees': { $exists: false }
      }).populate('customer product');

      for (const booking of overdueBookings) {
        const daysOverdue = Math.floor((new Date() - booking.endDate) / (1000 * 60 * 60 * 24));
        const lateFeeAmount = this.calculateLateFee(booking.totalAmount, daysOverdue);

        // Create late fee notification
        await this.createNotification({
          userId: booking.customer._id,
          type: 'error',
          title: 'Late Fee Applied',
          message: `Your booking #${booking.bookingNumber} is ${daysOverdue} day(s) overdue. Late fee of $${lateFeeAmount.toFixed(2)} has been applied.`,
          category: 'late_fee',
          priority: daysOverdue > 7 ? 'critical' : 'high',
          actionUrl: `/dashboard/customer/bookings/${booking._id}`,
          actionText: 'View Booking',
          metadata: {
            bookingId: booking._id,
            amount: lateFeeAmount,
            daysOverdue: daysOverdue
          }
        });

        // Update booking with late fee
        await Booking.findByIdAndUpdate(booking._id, {
          'payment.lateFees': {
            amount: lateFeeAmount,
            appliedAt: new Date(),
            daysOverdue: daysOverdue
          }
        });

        // Send email notification
        await queues.email.add('late_fee_notification', {
          type: 'late_fee_notification',
          data: {
            user: booking.customer,
            booking: booking,
            lateFeeAmount: lateFeeAmount,
            daysOverdue: daysOverdue
          }
        });
      }

      logger.info('Late fee check completed', { processed: overdueBookings.length });
    } catch (error) {
      logger.error('Failed to check late fees', { error: error.message });
      throw error;
    }
  }

  /**
   * Check for low stock products and create notifications
   */
  async checkLowStock() {
    try {
      const lowStockProducts = await Product.find({
        'inventory.quantity': { $lte: 5 },
        status: 'active'
      }).populate('provider');

      for (const product of lowStockProducts) {
        // Notify provider
        await this.createNotification({
          userId: product.provider._id,
          type: 'warning',
          title: 'Low Stock Alert',
          message: `Product "${product.name}" has only ${product.inventory.quantity} items remaining in stock.`,
          category: 'low_stock',
          priority: product.inventory.quantity <= 2 ? 'high' : 'medium',
          actionUrl: `/dashboard/provider/products/${product._id}`,
          actionText: 'Manage Stock',
          metadata: {
            productId: product._id,
            stockLevel: product.inventory.quantity
          }
        });

        // Notify admins if critical
        if (product.inventory.quantity <= 2) {
          const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } });
          
          for (const admin of admins) {
            await this.createNotification({
              userId: admin._id,
              type: 'warning',
              title: 'Critical Low Stock',
              message: `Product "${product.name}" has only ${product.inventory.quantity} items remaining. Provider: ${product.provider.firstName} ${product.provider.lastName}`,
              category: 'low_stock',
              priority: 'high',
              actionUrl: `/dashboard/admin/products/${product._id}`,
              actionText: 'Review Product',
              metadata: {
                productId: product._id,
                providerId: product.provider._id,
                stockLevel: product.inventory.quantity
              }
            });
          }
        }
      }

      logger.info('Low stock check completed', { processed: lowStockProducts.length });
    } catch (error) {
      logger.error('Failed to check low stock', { error: error.message });
      throw error;
    }
  }

  /**
   * Check for pending payments and create notifications
   */
  async checkPendingPayments() {
    try {
      const pendingPayments = await Booking.find({
        status: 'pending_payment',
        'payment.status': 'pending',
        createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Older than 24 hours
      }).populate('customer');

      for (const booking of pendingPayments) {
        await this.createNotification({
          userId: booking.customer._id,
          type: 'info',
          title: 'Payment Reminder',
          message: `Payment of $${booking.totalAmount.toFixed(2)} is pending for booking #${booking.bookingNumber}.`,
          category: 'payment',
          priority: 'medium',
          actionUrl: `/dashboard/customer/bookings/${booking._id}`,
          actionText: 'Complete Payment',
          metadata: {
            bookingId: booking._id,
            amount: booking.totalAmount
          }
        });
      }

      logger.info('Pending payment check completed', { processed: pendingPayments.length });
    } catch (error) {
      logger.error('Failed to check pending payments', { error: error.message });
      throw error;
    }
  }

  /**
   * Check for system health and create notifications
   */
  async checkSystemHealth() {
    try {
      // Check for failed payments
      const failedPayments = await Booking.find({
        'payment.status': 'failed',
        updatedAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
      });

      if (failedPayments.length > 10) {
        const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } });
        
        for (const admin of admins) {
          await this.createNotification({
            userId: admin._id,
            type: 'error',
            title: 'Payment System Alert',
            message: `${failedPayments.length} payments have failed in the last hour. Please check payment gateway status.`,
            category: 'system',
            priority: 'high',
            actionUrl: '/dashboard/admin/payments',
            actionText: 'Review Payments',
            metadata: {
              failedCount: failedPayments.length,
              timeWindow: '1 hour'
            }
          });
        }
      }

      // Check for high error rates
      const recentErrors = await this.getRecentErrors();
      if (recentErrors.length > 50) {
        const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } });
        
        for (const admin of admins) {
          await this.createNotification({
            userId: admin._id,
            type: 'error',
            title: 'High Error Rate Alert',
            message: `${recentErrors.length} errors detected in the last hour. System may need attention.`,
            category: 'system',
            priority: 'critical',
            actionUrl: '/dashboard/admin/system',
            actionText: 'View Logs',
            metadata: {
              errorCount: recentErrors.length,
              timeWindow: '1 hour'
            }
          });
        }
      }

      logger.info('System health check completed');
    } catch (error) {
      logger.error('Failed to check system health', { error: error.message });
      throw error;
    }
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId, options = {}) {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = options;
      
      const query = { user: userId };
      if (unreadOnly) {
        query.read = false;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Notification.countDocuments(query);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to get user notifications', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { read: true },
        { new: true }
      );

      if (notification) {
        this.emitNotificationUpdate(notification);
      }

      return notification;
    } catch (error) {
      logger.error('Failed to mark notification as read', { error: error.message, notificationId });
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { user: userId, read: false },
        { read: true }
      );

      // Emit update for all notifications
      this.emitBulkNotificationUpdate(userId);

      return result;
    } catch (error) {
      logger.error('Failed to mark all notifications as read', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        user: userId
      });

      if (notification) {
        this.emitNotificationDelete(notification);
      }

      return notification;
    } catch (error) {
      logger.error('Failed to delete notification', { error: error.message, notificationId });
      throw error;
    }
  }

  /**
   * Calculate late fee amount
   */
  calculateLateFee(baseAmount, daysOverdue) {
    const dailyRate = 0.05; // 5% per day
    return baseAmount * dailyRate * daysOverdue;
  }

  /**
   * Get recent system errors (mock implementation)
   */
  async getRecentErrors() {
    // This would typically query your error logs
    // For now, return empty array
    return [];
  }

  /**
   * Emit real-time notification
   */
  emitNotification(notification) {
    try {
      const io = require('../config/socket').getIO();
      if (io) {
        io.to(`user:${notification.user}`).emit('notification:new', notification);
      }
    } catch (error) {
      logger.error('Failed to emit notification', { error: error.message });
    }
  }

  /**
   * Emit notification update
   */
  emitNotificationUpdate(notification) {
    try {
      const io = require('../config/socket').getIO();
      if (io) {
        io.to(`user:${notification.user}`).emit('notification:update', notification);
      }
    } catch (error) {
      logger.error('Failed to emit notification update', { error: error.message });
    }
  }

  /**
   * Emit notification delete
   */
  emitNotificationDelete(notification) {
    try {
      const io = require('../config/socket').getIO();
      if (io) {
        io.to(`user:${notification.user}`).emit('notification:delete', notification._id);
      }
    } catch (error) {
      logger.error('Failed to emit notification delete', { error: error.message });
    }
  }

  /**
   * Emit bulk notification update
   */
  emitBulkNotificationUpdate(userId) {
    try {
      const io = require('../config/socket').getIO();
      if (io) {
        io.to(`user:${userId}`).emit('notifications:markAllRead');
      }
    } catch (error) {
      logger.error('Failed to emit bulk notification update', { error: error.message });
    }
  }

  /**
   * Run all notification checks
   */
  async runAllChecks() {
    try {
      await Promise.all([
        this.checkLateFees(),
        this.checkLowStock(),
        this.checkPendingPayments(),
        this.checkSystemHealth()
      ]);

      logger.info('All notification checks completed');
    } catch (error) {
      logger.error('Failed to run notification checks', { error: error.message });
      throw error;
    }
  }
}

module.exports = new NotificationService();
