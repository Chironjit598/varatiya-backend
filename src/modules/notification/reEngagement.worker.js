const UserInterest = require('./userInterest.model');
const Property = require('../property/property.model');
const notificationService = require('./notification.service');

class ReEngagementWorker {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  /**
   * Check if current time in Bangladesh (UTC+6) is within friendly hours (09:00 - 22:00)
   */
  isWithinAllowedHours() {
    const now = new Date();
    // Calculate Bangladesh local hour (UTC + 6)
    const utcHour = now.getUTCHours();
    const bdHour = (utcHour + 6) % 24;
    return bdHour >= 9 && bdHour < 22; // 9:00 AM to 10:00 PM
  }

  /**
   * Get today's date string in Bangladesh timezone (YYYY-MM-DD)
   */
  getTodayDateString() {
    const now = new Date();
    const bdTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    return bdTime.toISOString().slice(0, 10);
  }

  /**
   * Execute one round of candidate evaluation
   */
  async processCandidates() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      if (!this.isWithinAllowedHours()) {
        // Sleep during quiet hours (night)
        this.isRunning = false;
        return;
      }

      const now = new Date();
      const bdHour = (now.getUTCHours() + 6) % 24;
      // Trigger Mess Roster day-before reminders in the evening (between 18:00 and 22:00 BD time)
      if (bdHour >= 18 && bdHour <= 22) {
        try {
          const messService = require('../mess/mess.service');
          await messService.dispatchDailyRosterRemindersForAllMesses();
        } catch (rosterErr) {
          console.error('[ReEngagementWorker] Roster reminder error:', rosterErr.message);
        }
      }
      // Candidates who were active between 30 minutes and 3 hours ago
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Find interests where user was active ~30m ago and has NOT been notified in the last 24 hours
      const candidates = await UserInterest.find({
        userId: { $ne: null },
        lastActiveAt: { $lte: thirtyMinutesAgo, $gte: threeHoursAgo },
        $or: [
          { lastNotifiedAt: null },
          { lastNotifiedAt: { $lt: twentyFourHoursAgo } },
        ],
        'summary.totalViews': { $gte: 1 }, // viewed at least 1 or 2 properties
      })
        .limit(20)
        .lean();

      if (!candidates || candidates.length === 0) {
        this.isRunning = false;
        return;
      }

      const todayStr = this.getTodayDateString();

      for (const candidate of candidates) {
        try {
          // Anti-fatigue check: 1 implicit notification per day
          if (candidate.lastNotificationDate === todayStr && candidate.notificationCountToday >= 1) {
            continue;
          }

          const { primaryTenantType, primaryArea, avgBudget, maxBudget } = candidate.summary || {};
          if (!primaryArea && !primaryTenantType) continue;

          const viewedIds = (candidate.viewedProperties || []).map((v) => v.propertyId);

          // Build query for matching properties
          const matchQuery = {
            isActive: true,
            _id: { $nin: viewedIds },
          };

          if (primaryArea) {
            matchQuery.area = new RegExp(primaryArea.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
          }

          // Budget limit: within 30% tolerance of max budget or average
          const budgetCap = maxBudget > 0 ? maxBudget * 1.3 : avgBudget > 0 ? avgBudget * 1.35 : 0;
          if (budgetCap > 0) {
            matchQuery.rentPrice = { $lte: Math.round(budgetCap) };
          }

          // Tenant Type match
          if (primaryTenantType) {
            if (primaryTenantType === 'Mess') {
              matchQuery.isMess = true;
            } else {
              const escapedType = primaryTenantType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              matchQuery.$or = [
                { tenantTypes: { $in: [primaryTenantType, 'Any'] } },
                { tenantType: new RegExp(escapedType, 'i') },
                { tenantType: 'Any' },
              ];
            }
          }

          // Step 1: Check for brand new post created after user was last active
          let matchedProperty = await Property.findOne({
            ...matchQuery,
            createdAt: { $gte: candidate.lastActiveAt },
          })
            .sort({ createdAt: -1 })
            .lean();

          let notificationTitle = '';
          let notificationBody = '';
          const areaLabel = primaryArea || 'আপনার পছন্দের এলাকা';

          if (matchedProperty) {
            // Case A: Newly posted property while user was away
            notificationTitle = `${areaLabel}-এ নতুন বাসা পোস্ট হয়েছে!`;
            notificationBody = `${matchedProperty.title} (ভাড়া: ৳${matchedProperty.rentPrice}) — কিছুক্ষণ আগেই পোস্ট করা হয়েছে। অন্যরা নেওয়ার আগেই দেখে নিন!`;
          } else {
            // Step 2: Unseen matching property
            matchedProperty = await Property.findOne(matchQuery)
              .sort({ createdAt: -1 })
              .lean();

            if (matchedProperty) {
              // Case B: Unseen relevant property
              notificationTitle = `${areaLabel}-এর এই বাসাটি মিস হয়ে গেছে কি?`;
              notificationBody = `${matchedProperty.title} (ভাড়া: ৳${matchedProperty.rentPrice}) — আপনার পছন্দের সাথে দারুণ মিল। এখনই দেখুন!`;
            }
          }

          if (matchedProperty) {
            // Send In-App + FCM Notification
            await notificationService.createAndSendNotification({
              userId: candidate.userId,
              title: notificationTitle,
              body: notificationBody,
              type: 'RECOMMENDATION',
              data: {
                propertyId: matchedProperty._id,
                action: 'VIEW_PROPERTY',
                metadata: {
                  tenantType: primaryTenantType,
                  area: primaryArea,
                  rentPrice: matchedProperty.rentPrice,
                },
              },
            });

            // Update user interest record to prevent multiple triggers
            await UserInterest.updateOne(
              { _id: candidate._id },
              {
                lastNotifiedAt: new Date(),
                lastNotifiedPropertyId: matchedProperty._id,
                lastNotificationDate: todayStr,
                $inc: { notificationCountToday: 1 },
              }
            );

            console.log(
              `[ReEngagementWorker] Sent smart re-engagement notification to user ${candidate.userId} for property ${matchedProperty._id}`
            );
          }
        } catch (candidateErr) {
          console.error(`[ReEngagementWorker] Error processing candidate ${candidate.userId}:`, candidateErr.message);
        }
      }
    } catch (err) {
      console.error('[ReEngagementWorker] Execution error:', err.message);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Start recurring background worker (checks every 5 minutes)
   */
  start(intervalMs = 5 * 60 * 1000) {
    if (this.intervalId) return;
    console.log(`[ReEngagementWorker] Started smart re-engagement engine (checking every ${intervalMs / 1000}s)...`);
    // Run an initial check after 10 seconds
    setTimeout(() => this.processCandidates(), 10000);
    this.intervalId = setInterval(() => this.processCandidates(), intervalMs);
  }

  /**
   * Stop background worker gracefully
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[ReEngagementWorker] Worker stopped.');
    }
  }
}

module.exports = new ReEngagementWorker();

