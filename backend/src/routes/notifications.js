const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications with pagination and filtering
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false, category, priority } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true'
    };

    // Add filters if provided
    if (category || priority) {
      options.filters = {};
      if (category) options.filters.category = category;
      if (priority) options.filters.priority = priority;
    }

    const result = await notificationService.getUserNotifications(req.user.id, options);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Failed to get notifications', { error: error.message, userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const count = await Notification.getUnreadCount(req.user.id);
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    logger.error('Failed to get unread count', { error: error.message, userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/notifications/unread-by-category
 * @desc    Get unread notification count by category
 * @access  Private
 */
router.get('/unread-by-category', authenticate, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const categories = await Notification.getUnreadCountByCategory(req.user.id);
    
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    logger.error('Failed to get unread by category', { error: error.message, userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'Failed to get unread by category',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/notifications/unread-by-priority
 * @desc    Get unread notification count by priority
 * @access  Private
 */
router.get('/unread-by-priority', authenticate, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const priorities = await Notification.getUnreadCountByPriority(req.user.id);
    
    res.json({
      success: true,
      data: { priorities }
    });
  } catch (error) {
    logger.error('Failed to get unread by priority', { error: error.message, userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'Failed to get unread by priority',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await notificationService.markAsRead(id, req.user.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    logger.error('Failed to mark notification as read', { error: error.message, notificationId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', authenticate, async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    
    res.json({
      success: true,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    logger.error('Failed to mark all notifications as read', { error: error.message, userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await notificationService.deleteNotification(id, req.user.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      data: { deleted: true }
    });
  } catch (error) {
    logger.error('Failed to delete notification', { error: error.message, notificationId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/notifications
 * @desc    Create a new notification (admin only)
 * @access  Private (Admin)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const {
      userId,
      type,
      title,
      message,
      category,
      priority = 'medium',
      actionUrl,
      actionText,
      metadata
    } = req.body;

    // Validate required fields
    if (!userId || !type || !title || !message || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, type, title, message, category'
      });
    }

    const notification = await notificationService.createNotification({
      userId,
      type,
      title,
      message,
      category,
      priority,
      actionUrl,
      actionText,
      metadata,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    logger.error('Failed to create notification', { error: error.message, createdBy: req.user.id });
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/notifications/bulk
 * @desc    Create multiple notifications (admin only)
 * @access  Private (Admin)
 */
router.post('/bulk', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { notifications } = req.body;

    if (!Array.isArray(notifications) || notifications.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Notifications array is required and must not be empty'
      });
    }

    const createdNotifications = [];
    const errors = [];

    for (const notificationData of notifications) {
      try {
        const notification = await notificationService.createNotification({
          ...notificationData,
          createdBy: req.user.id
        });
        createdNotifications.push(notification);
      } catch (error) {
        errors.push({
          data: notificationData,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      data: {
        created: createdNotifications.length,
        errors: errors.length,
        errorDetails: errors
      }
    });
  } catch (error) {
    logger.error('Failed to create bulk notifications', { error: error.message, createdBy: req.user.id });
    res.status(500).json({
      success: false,
      message: 'Failed to create bulk notifications',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/notifications/test
 * @desc    Send test notification (admin only)
 * @access  Private (Admin)
 */
router.post('/test', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const testNotification = await notificationService.createNotification({
      userId: req.user.id,
      type: 'info',
      title: 'Test Notification',
      message: 'This is a test notification to verify the notification system is working correctly.',
      category: 'system',
      priority: 'low',
      actionUrl: '/dashboard/admin/notifications',
      actionText: 'View All',
      metadata: {
        test: true,
        timestamp: new Date().toISOString()
      },
      createdBy: req.user.id
    });

    res.json({
      success: true,
      data: testNotification,
      message: 'Test notification sent successfully'
    });
  } catch (error) {
    logger.error('Failed to send test notification', { error: error.message, userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/notifications/run-checks
 * @desc    Run all notification checks (admin only)
 * @access  Private (Admin)
 */
router.post('/run-checks', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    await notificationService.runAllChecks();

    res.json({
      success: true,
      message: 'All notification checks completed successfully'
    });
  } catch (error) {
    logger.error('Failed to run notification checks', { error: error.message, userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'Failed to run notification checks',
      error: error.message
    });
  }
});

module.exports = router;
