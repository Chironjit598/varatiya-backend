const Notification = require('./notification.model');
const UserInterest = require('./userInterest.model');
const Property = require('../property/property.model');
const User = require('../auth/user.model');

class NotificationService {
  /**
   * Format Notification object
   */
  formatNotification(doc) {
    if (!doc) return null;
    const obj = typeof doc.toJSON === 'function' ? doc.toJSON() : { ...doc };
    obj.id = (obj.id || obj._id || '').toString();
    obj._id = obj._id || obj.id;
    if (obj.userId) obj.userId = obj.userId.toString();
    return obj;
  }

  /**
   * Get paginated notifications for user
   */
  async getNotifications(userId, query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = { userId };
    if (query.unreadOnly === 'true' || query.unreadOnly === true) {
      filter.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('data.propertyId', 'title rentPrice area subArea imageUrls tenantType isMess')
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    return {
      notifications: notifications.map((n) => this.formatNotification(n)),
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(userId, notificationId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!notification) {
      const error = new Error('নোটিফিকেশন পাওয়া যায়নি (Notification not found)');
      error.statusCode = 404;
      throw error;
    }
    return this.formatNotification(notification);
  }

  /**
   * Mark all user notifications as read
   */
  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return { markedCount: result.modifiedCount || 0 };
  }

  /**
   * Save user's FCM device push token
   */
  async saveFcmToken(userId, fcmToken, deviceId = null) {
    if (!fcmToken || typeof fcmToken !== 'string') {
      const error = new Error('বৈধ FCM টোকেন প্রদান করুন (Valid fcmToken is required)');
      error.statusCode = 400;
      throw error;
    }

    const cleanToken = fcmToken.trim();

    if (userId) {
      await User.findByIdAndUpdate(userId, { fcmToken: cleanToken, lastActiveAt: new Date() });
      await UserInterest.findOneAndUpdate(
        { userId },
        { fcmToken: cleanToken, ...(deviceId ? { deviceId } : {}) },
        { upsert: true }
      );
    } else if (deviceId) {
      await UserInterest.findOneAndUpdate(
        { deviceId },
        { fcmToken: cleanToken },
        { upsert: true }
      );
    }

    return { success: true, message: 'FCM টোকেন সফলভাবে সংরক্ষিত হয়েছে' };
  }

  /**
   * Record a property view event to track user implicit interest
   */
  async recordPropertyView({ userId, deviceId, propertyId }) {
    if (!propertyId) return null;

    const property = await Property.findById(propertyId).lean();
    if (!property) return null;

    const query = userId ? { userId } : { deviceId };
    if (!userId && !deviceId) return null;

    let interest = await UserInterest.findOne(query);
    if (!interest) {
      interest = new UserInterest({
        ...(userId ? { userId } : {}),
        ...(deviceId ? { deviceId } : {}),
        viewedProperties: [],
        summary: {},
      });
    }

    // Check if viewed very recently (within 30 seconds) to avoid rapid spam clicks
    const lastView = interest.viewedProperties[interest.viewedProperties.length - 1];
    const isRecentDuplicate =
      lastView &&
      lastView.propertyId.toString() === propertyId.toString() &&
      Date.now() - new Date(lastView.viewedAt).getTime() < 30 * 1000;

    if (!isRecentDuplicate) {
      interest.viewedProperties.push({
        propertyId: property._id,
        tenantType: property.isMess ? 'Mess' : property.tenantType || 'Family',
        area: property.area || '',
        subArea: property.subArea || '',
        rentPrice: Number(property.rentPrice) || 0,
        isMess: Boolean(property.isMess),
        viewedAt: new Date(),
      });

      // Keep only last 50 viewed properties
      if (interest.viewedProperties.length > 50) {
        interest.viewedProperties = interest.viewedProperties.slice(-50);
      }
    }

    // Recalculate summary interest profile
    const typeCount = {};
    const areaCount = {};
    let totalBudget = 0;
    let minBudget = Infinity;
    let maxBudget = 0;
    const views = interest.viewedProperties;

    for (const v of views) {
      const t = v.tenantType || 'Family';
      typeCount[t] = (typeCount[t] || 0) + 1;

      if (v.area) {
        areaCount[v.area] = (areaCount[v.area] || 0) + 1;
      }

      if (v.rentPrice > 0) {
        totalBudget += v.rentPrice;
        if (v.rentPrice < minBudget) minBudget = v.rentPrice;
        if (v.rentPrice > maxBudget) maxBudget = v.rentPrice;
      }
    }

    // Determine primary tenant type
    let topType = '';
    let maxTypeFreq = 0;
    for (const [t, freq] of Object.entries(typeCount)) {
      if (freq > maxTypeFreq) {
        maxTypeFreq = freq;
        topType = t;
      }
    }

    // Determine primary area
    let topArea = '';
    let maxAreaFreq = 0;
    for (const [a, freq] of Object.entries(areaCount)) {
      if (freq > maxAreaFreq) {
        maxAreaFreq = freq;
        topArea = a;
      }
    }

    interest.summary = {
      primaryTenantType: topType || property.tenantType || 'Family',
      primaryArea: topArea || property.area || '',
      primarySubArea: property.subArea || '',
      avgBudget: views.length > 0 ? Math.round(totalBudget / views.length) : 0,
      minBudget: minBudget === Infinity ? 0 : minBudget,
      maxBudget: maxBudget,
      totalViews: views.length,
    };

    interest.lastActiveAt = new Date();
    await interest.save();

    if (userId) {
      await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() });
    }

    return interest;
  }

  /**
   * Dispatch notification to user (In-app + FCM Push)
   */
  async createAndSendNotification({ userId, title, body, type = 'RECOMMENDATION', data = {} }) {
    if (!userId) return null;

    // 1. Create In-App Notification Record
    const notification = await Notification.create({
      userId,
      title,
      body,
      type,
      data,
    });

    // 2. Fetch User to check FCM Token
    try {
      const user = await User.findById(userId).select('fcmToken').lean();
      if (user && user.fcmToken) {
        // FCM push delivery (if firebase-admin is integrated, call here; otherwise log)
        console.log(`[FCM PUSH] Sending notification to user ${userId} (Token: ${user.fcmToken.slice(0, 10)}...): "${title}"`);
      }
    } catch (pushErr) {
      console.error('[NotificationService] Push delivery error:', pushErr.message);
    }

    return this.formatNotification(notification);
  }

  /**
   * Get user interest profile (for debugging/admin/recommendation)
   */
  async getUserInterest(userId) {
    return UserInterest.findOne({ userId })
      .populate('viewedProperties.propertyId', 'title rentPrice area imageUrls')
      .lean();
  }
}

module.exports = new NotificationService();
