const notificationService = require('./notification.service');
const ApiResponse = require('../../utils/apiResponse');

class NotificationController {
  /**
   * Get all notifications for logged-in user
   * GET /api/notifications
   */
  async getNotifications(req, res, next) {
    try {
      const result = await notificationService.getNotifications(req.user._id, req.query);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'নোটিফিকেশন তালিকা সফলভাবে লোড হয়েছে',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark single notification as read
   * PATCH /api/notifications/:id/read
   */
  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.user._id, req.params.id);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'নোটিফিকেশন পঠিত হিসেবে চিহ্নিত করা হয়েছে',
        data: { notification },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   * PATCH /api/notifications/read-all
   */
  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user._id);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'সবগুলো নোটিফিকেশন পঠিত হিসেবে চিহ্নিত করা হয়েছে',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register or update user device FCM push token
   * POST /api/notifications/fcm-token
   */
  async saveFcmToken(req, res, next) {
    try {
      const userId = req.user ? req.user._id : null;
      const { fcmToken, deviceId } = req.body;
      const result = await notificationService.saveFcmToken(userId, fcmToken, deviceId);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Track user property view / click telemetry
   * POST /api/notifications/track-view
   */
  async trackView(req, res, next) {
    try {
      const userId = req.user ? req.user._id : null;
      const { propertyId, deviceId } = req.body;

      if (!propertyId) {
        return ApiResponse.error(res, {
          statusCode: 400,
          message: 'প্রপার্টি আইডি আবশ্যক (propertyId is required)',
        });
      }

      const interest = await notificationService.recordPropertyView({
        userId,
        deviceId,
        propertyId,
      });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'ইন্টারেস্ট সফলভাবে রেকর্ড করা হয়েছে',
        data: { summary: interest ? interest.summary : null },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's current behavioral interest profile
   * GET /api/notifications/my-interest
   */
  async getMyInterest(req, res, next) {
    try {
      const interest = await notificationService.getUserInterest(req.user._id);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'ইউজারের ইন্টারেস্ট প্রোফাইল লোড হয়েছে',
        data: { interest },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reactivate a property directly from a notification
   * POST /api/notifications/:id/reactivate
   */
  async reactivateFromNotification(req, res, next) {
    try {
      const result = await notificationService.reactivateFromNotification(
        req.user._id,
        req.params.id
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();

