const Alert = require('./alert.model');
const Property = require('../property/property.model');
const notificationService = require('../notification/notification.service');

class AlertService {
  formatAlert(doc) {
    if (!doc) return null;
    const obj = typeof doc.toJSON === 'function' ? doc.toJSON() : { ...doc };
    obj.id = (obj.id || obj._id || '').toString();
    obj._id = obj._id || obj.id;
    if (obj.userId) obj.userId = obj.userId.toString();
    return obj;
  }

  /**
   * Get all alerts for logged-in user
   */
  async getAlerts(userId) {
    const alerts = await Alert.find({ userId }).sort({ createdAt: -1 }).lean();
    return alerts.map((a) => this.formatAlert(a));
  }

  /**
   * Create a new rental alert subscription
   */
  async createAlert(userId, payload) {
    const { title, area, subArea, tenantType, maxPrice, isEnabled } = payload;

    const cleanArea = String(area || '').trim();
    const cleanSubArea = subArea ? String(subArea).trim() : '';
    const cleanTenantType = tenantType ? String(tenantType).trim() : 'Any';
    const budget = Number(maxPrice) || 0;

    if (!cleanArea) {
      const error = new Error('এলাকা নির্বাচন করুন (Area is required)');
      error.statusCode = 400;
      throw error;
    }

    if (budget <= 0) {
      const error = new Error('সর্বোচ্চ বাজেট সঠিক হতে হবে (Valid maxPrice is required)');
      error.statusCode = 400;
      throw error;
    }

    const computedTitle =
      title && String(title).trim().length > 0
        ? String(title).trim()
        : `${cleanSubArea || cleanArea} - ${cleanTenantType} (≤ ৳${budget})`;

    // Count existing active properties matching this alert
    const matchFilter = {
      isActive: true,
      area: new RegExp(`^${cleanArea.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
      rentPrice: { $lte: budget },
    };

    if (cleanSubArea) {
      matchFilter.subArea = new RegExp(
        cleanSubArea.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
      );
    }

    if (cleanTenantType && cleanTenantType !== 'Any') {
      const escapedTenant = cleanTenantType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      matchFilter.$or = [
        { tenantTypes: { $in: [cleanTenantType, 'Any'] } },
        { tenantType: new RegExp(escapedTenant, 'i') },
        { tenantType: 'Any' },
      ];
    }

    let initialMatches = 0;
    try {
      initialMatches = await Property.countDocuments(matchFilter);
    } catch {
      initialMatches = 0;
    }

    const alert = await Alert.create({
      userId,
      title: computedTitle,
      area: cleanArea,
      subArea: cleanSubArea,
      tenantType: cleanTenantType,
      maxPrice: budget,
      isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
      matchCount: initialMatches,
    });

    return this.formatAlert(alert);
  }

  /**
   * Toggle alert enabled/disabled status
   */
  async toggleAlert(alertId, userId) {
    const alert = await Alert.findOne({ _id: alertId, userId });
    if (!alert) {
      const error = new Error('অ্যালার্টটি পাওয়া যায়নি (Alert not found)');
      error.statusCode = 404;
      throw error;
    }

    alert.isEnabled = !alert.isEnabled;
    await alert.save();

    return this.formatAlert(alert);
  }

  /**
   * Delete an alert
   */
  async deleteAlert(alertId, userId) {
    const alert = await Alert.findOne({ _id: alertId, userId });
    if (!alert) {
      const error = new Error('অ্যালার্টটি পাওয়া যায়নি (Alert not found)');
      error.statusCode = 404;
      throw error;
    }

    await alert.deleteOne();
    return true;
  }

  /**
   * Check active alerts against a newly posted property and increment matchCount
   */
  async matchPropertyWithAlerts(property) {
    if (!property || !property.isActive) return 0;

    const activeAlerts = await Alert.find({
      isEnabled: true,
      maxPrice: { $gte: Number(property.rentPrice) || 0 },
    });

    const propArea = (property.area || '').trim().toLowerCase();
    const propSubArea = (property.subArea || '').trim().toLowerCase();
    const propTenantType = (property.tenantType || '').toLowerCase();
    const propTenantTypes = Array.isArray(property.tenantTypes)
      ? property.tenantTypes.map((t) => String(t).toLowerCase())
      : [];

    const matchedAlertIds = [];

    for (const alert of activeAlerts) {
      const alertArea = (alert.area || '').trim().toLowerCase();
      const alertSubArea = (alert.subArea || '').trim().toLowerCase();
      const alertTenant = (alert.tenantType || '').trim().toLowerCase();

      // Area match
      const areaMatches =
        !alertArea || propArea === alertArea || propArea.includes(alertArea) || alertArea.includes(propArea);
      if (!areaMatches) continue;

      // SubArea match (if alert specifies subArea)
      const subAreaMatches =
        !alertSubArea ||
        propSubArea === alertSubArea ||
        propSubArea.includes(alertSubArea) ||
        alertSubArea.includes(propSubArea);
      if (!subAreaMatches) continue;

      // TenantType match
      const tenantMatches =
        !alertTenant ||
        alertTenant === 'any' ||
        propTenantType === 'any' ||
        propTenantType.includes(alertTenant) ||
        alertTenant.includes(propTenantType) ||
        propTenantTypes.includes('any') ||
        propTenantTypes.some((t) => t.includes(alertTenant) || alertTenant.includes(t));

      if (!tenantMatches) continue;

      matchedAlertIds.push(alert._id);
    }

    if (matchedAlertIds.length > 0) {
      await Alert.updateMany(
        { _id: { $in: matchedAlertIds } },
        { $inc: { matchCount: 1 } }
      );

      // Dispatch notifications to alert owners
      for (const alert of activeAlerts) {
        if (matchedAlertIds.includes(alert._id) && alert.userId) {
          notificationService
            .createAndSendNotification({
              userId: alert.userId,
              title: `নতুন বাসা পাওয়া গেছে: ${property.area}`,
              body: `${property.title} (ভাড়া: ৳${property.rentPrice}) আপনার "${alert.title}" অ্যালার্টের সাথে মিলেছে!`,
              type: 'ALERT_MATCH',
              data: {
                propertyId: property._id,
                action: 'VIEW_PROPERTY',
              },
            })
            .catch((err) => console.error('[Alert Notification Error]:', err.message));
        }
      }
    }

    return matchedAlertIds.length;
  }
}

module.exports = new AlertService();

