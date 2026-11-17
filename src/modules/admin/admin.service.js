const User = require('../auth/user.model');
const Property = require('../property/property.model');
const GuestDeviceTracking = require('../property/guestDeviceTracking.model');
const PendingVerification = require('../payment/pendingVerification.model');
const IncomingSms = require('../payment/incomingSms.model');
const UserInterest = require('../notification/userInterest.model');
const paymentService = require('../payment/payment.service');

class AdminService {
  /**
   * Helper to get Bangladesh (UTC+6) Start of Day
   */
  getStartOfTodayBST() {
    const now = new Date();
    const nowBST = new Date(now.getTime() + 6 * 3600 * 1000);
    return new Date(
      Date.UTC(nowBST.getUTCFullYear(), nowBST.getUTCMonth(), nowBST.getUTCDate(), 0, 0, 0) -
        6 * 3600 * 1000
    );
  }

  /**
   * Comprehensive stats for the Admin Dashboard
   */
  async getDashboardStats() {
    const startOfToday = this.getStartOfTodayBST();
    const currentMonthYear = paymentService.getCurrentMonthYear();

    const [
      totalUsers,
      todayUsers,
      recentUsers,
      paidUsers,
      totalProperties,
      todayProperties,
      limitDevicesRaw,
      recentSms,
      recentPending,
    ] = await Promise.all([
      User.countDocuments(),
      User.find({ createdAt: { $gte: startOfToday } })
        .sort({ createdAt: -1 })
        .select('name phoneNumber role isPaid paidMonth createdAt'),
      User.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .select('name phoneNumber role isPaid paidMonth createdAt'),
      User.find({ isPaid: true, paidMonth: currentMonthYear })
        .sort({ updatedAt: -1 })
        .select('name phoneNumber role isPaid paidMonth paidUntil updatedAt'),
      Property.countDocuments(),
      Property.countDocuments({ createdAt: { $gte: startOfToday } }),
      GuestDeviceTracking.find({ count: { $gte: 3 } }).sort({ updatedAt: -1 }),
      IncomingSms.find().sort({ receivedAt: -1 }).limit(10),
      PendingVerification.find().sort({ createdAt: -1 }).limit(10),
    ]);

    // Build enriched limit reached devices with viewed properties & correlated phone numbers
    const enrichedLimitDevices = [];
    for (const dev of limitDevicesRaw) {
      // Find viewed properties
      const props = await Property.find({ _id: { $in: dev.viewedPropertyIds } })
        .select('title area rent contactPhone landlordPhone propertyCode')
        .lean();

      // Check if device already has phoneNumber or is linked in PendingVerification / UserInterest
      let matchedPhone = dev.phoneNumber || null;
      let matchedUserName = dev.userName || null;
      let isPaid = false;

      if (!matchedPhone) {
        const pending = await PendingVerification.findOne({ deviceId: dev.deviceId });
        if (pending?.phoneNumber) matchedPhone = pending.phoneNumber;
      }

      if (!matchedPhone) {
        const interest = await UserInterest.findOne({ deviceId: dev.deviceId });
        if (interest?.userId) {
          const u = await User.findById(interest.userId).select('name phoneNumber isPaid');
          if (u) {
            matchedPhone = u.phoneNumber;
            matchedUserName = u.name;
            isPaid = u.isPaid;
          }
        }
      }

      if (matchedPhone && (!matchedUserName || !isPaid)) {
        const u = await User.findOne({ phoneNumber: matchedPhone }).select('name phoneNumber isPaid');
        if (u) {
          matchedUserName = u.name;
          isPaid = u.isPaid;
        }
      }

      enrichedLimitDevices.push({
        deviceId: dev.deviceId,
        shortDeviceId: dev.deviceId.slice(-10),
        count: dev.count,
        monthYear: dev.monthYear,
        updatedAt: dev.updatedAt,
        matchedPhone,
        matchedUserName: matchedUser?.name || null,
        isPaid: matchedUser?.isPaid || false,
        properties: props.map((p) => ({
          id: p._id,
          propertyCode: p.propertyCode || '',
          title: p.title,
          area: p.area,
          rent: p.rentPrice || 'আলোচনা সাপেক্ষে',
          phone: p.contactPhone || p.landlordPhone,
        })),
      });
    }

    return {
      summary: {
        totalUsers,
        todayUsersCount: todayUsers.length,
        limitReachedCount: limitDevicesRaw.length,
        paidUsersCount: paidUsers.length,
        totalProperties,
        todayPropertiesCount: todayProperties,
        appMode: paymentService.getAppMode(),
        isPaymentEnabled: paymentService.isPaymentEnabled(),
        currentMonthYear,
        bengaliMonth: paymentService.getBengaliMonthName(),
        serverTimeBST: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
      },
      limitReachedDevices: enrichedLimitDevices,
      todayUsers,
      recentUsers,
      paidUsers,
      recentSms,
      recentPending,
    };
  }

  /**
   * Toggle App Mode (Review vs Live)
   */
  async setAppMode(mode) {
    return paymentService.setAppMode(mode);
  }

  /**
   * Manually approve / unlock a customer by phone number
   */
  async manualApproveUser(phoneNumber) {
    const monthYear = paymentService.getCurrentMonthYear();
    const cleanPhone = paymentService.normalizePhoneNumber(phoneNumber);

    if (!cleanPhone || cleanPhone.length !== 11) {
      throw new Error('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন');
    }

    // 1. Create a recorded manual SMS
    const fakeSms = await IncomingSms.create({
      senderNumber: cleanPhone,
      amount: 50,
      trxId: 'ADMIN_' + Date.now().toString().slice(-6),
      rawSms: `Admin Manual Approval for Tk 50 from ${cleanPhone}`,
      provider: 'BKASH',
      isClaimed: true,
      monthYear,
      receivedAt: new Date(),
    });

    // 2. Activate or Register User
    const userResult = await paymentService.activateOrRegisterPaidUser(cleanPhone, monthYear);
    fakeSms.claimedByUserId = userResult.user._id || userResult.user.id;
    await fakeSms.save();

    // 3. Resolve any waiting pending verification
    const pending = await PendingVerification.findOne({ phoneNumber: cleanPhone, monthYear });
    if (pending) {
      pending.status = 'MATCHED';
      pending.matchedSmsId = fakeSms._id;
      pending.matchedUserId = userResult.user._id || userResult.user.id;
      pending.autoPassword = userResult.autoPassword;
      pending.token = userResult.tokens.accessToken;
      await pending.save();
    }

    return {
      success: true,
      user: userResult.user,
      autoPassword: userResult.autoPassword,
      message: `${cleanPhone} নম্বরটি সফলভাবে আনলক ও পেইড করা হয়েছে!`,
    };
  }
}

module.exports = new AdminService();

