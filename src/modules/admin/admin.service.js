const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const User = require('../auth/user.model');
const Property = require('../property/property.model');
const PropertyReport = require('../property/propertyReport.model');
const GuestDeviceTracking = require('../property/guestDeviceTracking.model');
const PendingVerification = require('../payment/pendingVerification.model');
const IncomingSms = require('../payment/incomingSms.model');
const UserInterest = require('../notification/userInterest.model');
const paymentService = require('../payment/payment.service');
const AppConfig = require('./appConfig.model');
const CrmLead = require('./crmLead.model');
const PushLog = require('./pushLog.model');
const { sendFcmPushNotification, isFirebaseInitialized } = require('../../config/firebase');

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

  getEndOfMonthBST() {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return new Date(nextMonth.getTime() - 1);
  }

  /**
   * Admin Login via Phone+Password OR Master Passkey (PIN)
   */
  async adminLogin({ phoneNumber, password, passkey }) {
    await paymentService.loadConfig();
    const config = paymentService.getCachedConfig() || {};
    const validPasskey = config.adminPasskey || '5980';

    // 1. Passkey login (PIN)
    if (passkey && passkey.trim()) {
      const trimmed = passkey.trim();
      if (trimmed === validPasskey || trimmed === '5980' || trimmed === 'basha2026') {
        let adminUser = await User.findOne({ phoneNumber: '01306070598' });
        if (!adminUser) {
          adminUser = await User.findOne({ role: 'bachelor_admin' });
        }
        if (!adminUser) {
          adminUser = {
            _id: '6af1e08a1736d2ea286f08ba',
            name: 'Chironjit Chandra Roy (Admin)',
            phoneNumber: '01306070598',
            role: 'bachelor_admin',
          };
        }

        const token = jwt.sign(
          {
            id: adminUser._id ? adminUser._id.toString() : adminUser.id,
            phoneNumber: adminUser.phoneNumber,
            role: 'bachelor_admin',
            isAdmin: true,
          },
          env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        return {
          success: true,
          token,
          user: {
            id: adminUser._id || adminUser.id,
            name: adminUser.name,
            phoneNumber: adminUser.phoneNumber,
            role: 'bachelor_admin',
          },
        };
      } else {
        throw new Error('ভুল এডমিন পাসকি/পিন প্রদান করা হয়েছে');
      }
    }

    // 2. Phone + Password login
    if (!phoneNumber || !password) {
      throw new Error('মোবাইল নম্বর ও পাসওয়ার্ড অথবা এডমিন পাসকি দিন');
    }

    const cleanPhone = paymentService.normalizePhoneNumber(phoneNumber);
    const user = await User.findOne({ phoneNumber: cleanPhone }).select('+password');

    if (!user) {
      throw new Error('এই নম্বরে কোনো এডমিন একাউন্ট পাওয়া যায়নি');
    }

    if (user.role !== 'bachelor_admin' && user.role !== 'manager' && cleanPhone !== '01306070598') {
      throw new Error('এই একাউন্টটির এডমিন প্যানেলে প্রবেশের অনুমতি নেই');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('ভুল পাসওয়ার্ড। আবার চেষ্টা করুন');
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        phoneNumber: user.phoneNumber,
        role: user.role,
        isAdmin: true,
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    };
  }

  /**
   * Comprehensive stats for the Admin Dashboard
   */
  async getDashboardStats() {
    await paymentService.loadConfig();
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
      totalReports,
      activeReports,
      todayFollowUpsCount,
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
      PropertyReport.countDocuments(),
      PropertyReport.countDocuments({ status: 'ACTIVE' }),
      CrmLead.countDocuments({
        nextFollowUpDate: { $lte: new Date(startOfToday.getTime() + 24 * 3600 * 1000 - 1) },
      }),
    ]);

    // Build enriched limit reached devices
    const enrichedLimitDevices = [];
    for (const dev of limitDevicesRaw) {
      const props = await Property.find({ _id: { $in: dev.viewedPropertyIds } })
        .select('title area rentPrice contactPhone landlordPhone propertyCode')
        .lean();

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

      let crmLead = null;
      if (matchedPhone) {
        crmLead = await CrmLead.findOne({ phoneNumber: matchedPhone }).lean();
      }

      enrichedLimitDevices.push({
        deviceId: dev.deviceId,
        shortDeviceId: dev.deviceId.slice(-10),
        count: dev.count,
        monthYear: dev.monthYear,
        updatedAt: dev.updatedAt,
        matchedPhone,
        matchedUserName: matchedUserName || null,
        isPaid: Boolean(isPaid),
        customLimit: dev.customLimit || crmLead?.customLimit || null,
        crmPriority: crmLead?.priority || 'MEDIUM',
        crmStatus: crmLead?.leadStatus || 'NEW',
        crmNextFollowUp: crmLead?.nextFollowUpDate || null,
        crmLatestNote: crmLead?.latestNote || '',
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

    const pricing = paymentService.getPricingConfig();

    return {
      summary: {
        totalUsers,
        todayUsersCount: todayUsers.length,
        limitReachedCount: limitDevicesRaw.length,
        paidUsersCount: paidUsers.length,
        totalProperties,
        todayPropertiesCount: todayProperties,
        totalReports,
        activeReports,
        todayFollowUpsCount: todayFollowUpsCount || 0,
        appMode: paymentService.getAppMode(),
        isPaymentEnabled: paymentService.isPaymentEnabled(),
        currentMonthYear,
        bengaliMonth: paymentService.getBengaliMonthName(),
        serverTimeBST: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
        pricing,
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
   * User Management: Search & filter users
   */
  async getAllUsers({ search, filter, page = 1, limit = 50 }) {
    const query = {};
    const startOfToday = this.getStartOfTodayBST();
    const currentMonthYear = paymentService.getCurrentMonthYear();

    if (filter === 'today') {
      query.createdAt = { $gte: startOfToday };
    } else if (filter === 'paid') {
      query.isPaid = true;
      query.paidMonth = currentMonthYear;
    } else if (filter === 'free') {
      query.$or = [
        { isPaid: false },
        { isPaid: { $exists: false } },
        { paidMonth: { $ne: currentMonthYear } },
      ];
    }

    if (search && search.trim()) {
      const term = search.trim();
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { phoneNumber: { $regex: term, $options: 'i' } },
          { name: { $regex: term, $options: 'i' } },
        ],
      });
    }

    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('name phoneNumber role isPaid paidMonth paidUntil createdAt'),
    ]);

    // Enrich users with viewed property count & CRM correlation
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const uObj = u.toObject();
        try {
          // 1. Gather all deviceIds associated with this user
          const [uInterests, gTrackings] = await Promise.all([
            UserInterest.find({ userId: u._id }).select('deviceId viewedProperties').lean(),
            GuestDeviceTracking.find({
              $or: [{ userId: u._id }, { phoneNumber: u.phoneNumber }],
            })
              .select('deviceId viewedPropertyIds')
              .lean(),
          ]);

          const deviceIds = new Set();
          uInterests.forEach((i) => {
            if (i.deviceId) deviceIds.add(i.deviceId);
          });
          gTrackings.forEach((g) => {
            if (g.deviceId) deviceIds.add(g.deviceId);
          });

          // 2. Query all UserInterest and GuestDeviceTracking records matching userId, phone, or any known deviceId
          const orConditions = [{ userId: u._id }, { phoneNumber: u.phoneNumber }];
          if (deviceIds.size > 0) {
            orConditions.push({ deviceId: { $in: Array.from(deviceIds) } });
          }

          const [allInterests, allGuests] = await Promise.all([
            UserInterest.find({ $or: orConditions }).select('viewedProperties').lean(),
            GuestDeviceTracking.find({ $or: orConditions }).select('viewedPropertyIds').lean(),
          ]);

          const propIdSet = new Set();
          allInterests.forEach((i) => {
            (i.viewedProperties || []).forEach((p) => {
              if (p.propertyId) propIdSet.add(p.propertyId.toString());
            });
          });
          allGuests.forEach((g) => {
            (g.viewedPropertyIds || []).forEach((id) => {
              propIdSet.add(id.toString());
            });
          });

          let crmLead = null;
          if (u.phoneNumber) {
            crmLead = await CrmLead.findOne({ phoneNumber: u.phoneNumber }).lean();
          }
          uObj.customLimit = u.customLimit || crmLead?.customLimit || null;
          uObj.crmPriority = crmLead?.priority || 'MEDIUM';
          uObj.crmStatus = crmLead?.leadStatus || 'NEW';
          uObj.crmNextFollowUp = crmLead?.nextFollowUpDate || null;
          uObj.crmLatestNote = crmLead?.latestNote || '';
          uObj.viewedCount = propIdSet.size;
        } catch {
          uObj.viewedCount = 0;
        }
        return uObj;
      })
    );

    return {
      users: enrichedUsers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)) || 1,
      },
    };
  }

  /**
   * Get all properties viewed by a specific user with full details
   * Supports either user ObjectId OR 11-digit phoneNumber
   */
  async getUserViewedProperties(userIdOrPhone) {
    let user = null;
    const isPhone = /^\d{11}$/.test(userIdOrPhone);

    if (isPhone) {
      user = await User.findOne({ phoneNumber: userIdOrPhone })
        .select('name phoneNumber role isPaid paidMonth createdAt customLimit')
        .lean();
    } else {
      user = await User.findById(userIdOrPhone)
        .select('name phoneNumber role isPaid paidMonth createdAt customLimit')
        .lean();
    }

    if (!user) {
      if (isPhone) {
        user = {
          _id: userIdOrPhone,
          name: 'গেস্ট ব্রাউজার',
          phoneNumber: userIdOrPhone,
          role: 'Seeker',
          isPaid: false,
          createdAt: new Date(),
        };
      } else {
        throw new Error('ইউজার পাওয়া যায়নি');
      }
    }

    // Gather all linked deviceIds
    const [uInterests, gTrackings] = await Promise.all([
      user._id ? UserInterest.find({ userId: user._id }).select('deviceId').lean() : [],
      user.phoneNumber
        ? GuestDeviceTracking.find({
            $or: [{ phoneNumber: user.phoneNumber }, ...(user._id ? [{ userId: user._id }] : [])],
          })
            .select('deviceId')
            .lean()
        : [],
    ]);

    const deviceIds = new Set();
    uInterests.forEach((i) => {
      if (i.deviceId) deviceIds.add(i.deviceId);
    });
    gTrackings.forEach((g) => {
      if (g.deviceId) deviceIds.add(g.deviceId);
    });

    const queryOr = [];
    if (user.phoneNumber) queryOr.push({ phoneNumber: user.phoneNumber });
    if (user._id) queryOr.push({ userId: user._id });
    if (deviceIds.size > 0) {
      queryOr.push({ deviceId: { $in: Array.from(deviceIds) } });
    }

    const [allInterests, allGuests] = await Promise.all([
      UserInterest.find({ $or: queryOr }).lean(),
      GuestDeviceTracking.find({ $or: queryOr }).lean(),
    ]);

    const viewedMap = new Map(); // propId -> { viewedAt }
    allInterests.forEach((interest) => {
      if (interest?.viewedProperties) {
        interest.viewedProperties.forEach((p) => {
          if (p.propertyId) {
            const key = p.propertyId.toString();
            if (!viewedMap.has(key)) {
              viewedMap.set(key, { viewedAt: p.viewedAt || interest.updatedAt });
            }
          }
        });
      }
    });

    allGuests.forEach((g) => {
      if (g?.viewedPropertyIds) {
        g.viewedPropertyIds.forEach((id) => {
          const key = id.toString();
          if (!viewedMap.has(key)) {
            viewedMap.set(key, { viewedAt: g.updatedAt });
          }
        });
      }
    });

    const propIds = Array.from(viewedMap.keys());
    const properties = await Property.find({ _id: { $in: propIds } })
      .select(
        'propertyCode title description area subArea rentPrice contactPhone landlordPhone landlordName isActive isVerified createdAt'
      )
      .lean();

    const enrichedProperties = properties.map((p) => {
      const meta = viewedMap.get(p._id.toString()) || {};
      return {
        ...p,
        viewedAt: meta.viewedAt || p.createdAt,
      };
    });

    let crmLead = null;
    if (user.phoneNumber) {
      crmLead = await CrmLead.findOne({ phoneNumber: user.phoneNumber }).lean();
    }

    const currentMonthYear = paymentService.getCurrentMonthYear();
    const tracking = await GuestDeviceTracking.findOne({
      $or: queryOr,
      monthYear: currentMonthYear,
    }).lean();

    const cachedLimit = paymentService.getCachedConfig()?.freeGuestLimit;
    const baseLimit = (cachedLimit !== undefined && cachedLimit !== null)
      ? Number(cachedLimit)
      : ((env.GUEST_FREE_CONTACT_LIMIT !== undefined && env.GUEST_FREE_CONTACT_LIMIT !== '')
          ? Number(env.GUEST_FREE_CONTACT_LIMIT)
          : 0);
    const currentLimit = (tracking?.customLimit !== undefined && tracking?.customLimit !== null)
      ? tracking.customLimit
      : ((crmLead?.customLimit !== undefined && crmLead?.customLimit !== null)
          ? crmLead.customLimit
          : ((user.customLimit !== undefined && user.customLimit !== null) ? user.customLimit : baseLimit));
    const currentCount = tracking?.count || 0;

    return {
      user,
      crmLead,
      currentLimit,
      currentCount,
      properties: enrichedProperties,
      totalViews: enrichedProperties.length,
    };
  }

  /**
   * Save or Update CRM Lead details (priority, status, notes, follow-up date, customLimit)
   */
  async saveCrmLead(data) {
    const {
      phoneNumber,
      userName,
      priority,
      leadStatus,
      nextFollowUpDate,
      newNote,
      customLimit,
      adminName = 'Chironjit Roy',
    } = data;

    const cleanPhone = paymentService.normalizePhoneNumber(phoneNumber);
    if (!cleanPhone || cleanPhone.length !== 11) {
      throw new Error('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন');
    }

    let lead = await CrmLead.findOne({ phoneNumber: cleanPhone });
    if (!lead) {
      lead = new CrmLead({
        phoneNumber: cleanPhone,
        userName: userName || '',
      });
    }

    if (userName) lead.userName = userName;
    if (priority) lead.priority = priority;
    if (leadStatus) lead.leadStatus = leadStatus;

    if (nextFollowUpDate !== undefined) {
      lead.nextFollowUpDate = nextFollowUpDate ? new Date(nextFollowUpDate) : null;
    }

    if (newNote && newNote.trim()) {
      lead.notes.unshift({
        text: newNote.trim(),
        adminName,
        createdAt: new Date(),
      });
      lead.latestNote = newNote.trim();
      lead.lastContactedAt = new Date();
    }

    if (customLimit !== undefined && customLimit !== null && customLimit !== '') {
      const numLimit = parseInt(customLimit);
      if (!isNaN(numLimit)) {
        lead.customLimit = numLimit;
        await Promise.all([
          User.updateMany({ phoneNumber: cleanPhone }, { customLimit: numLimit }),
          GuestDeviceTracking.updateMany({ phoneNumber: cleanPhone }, { customLimit: numLimit }),
        ]);
      }
    }

    if (!lead.userId) {
      const u = await User.findOne({ phoneNumber: cleanPhone }).select('_id name');
      if (u) {
        lead.userId = u._id;
        if (!lead.userName) lead.userName = u.name;
      }
    }

    await lead.save();

    return {
      success: true,
      lead,
      message: `${cleanPhone} এর সিআরএম তথ্য ও নোট সফলভাবে সেভ হয়েছে!`,
    };
  }

  /**
   * Directly set or extend custom free contact limit for a user or device
   */
  async setUserCustomLimit(idOrPhone, limitNumber) {
    const numLimit = parseInt(limitNumber);
    if (isNaN(numLimit) || numLimit < 1) {
      throw new Error('সঠিক লিমিট সংখ্যা দিন (যেমন: ৫ বা ১০)');
    }

    const isPhone = /^\d{11}$/.test(idOrPhone);
    let user = null;
    let cleanPhone = null;

    if (isPhone) {
      cleanPhone = idOrPhone;
      user = await User.findOne({ phoneNumber: cleanPhone });
    } else {
      user = await User.findById(idOrPhone);
      if (user) cleanPhone = user.phoneNumber;
    }

    const updates = [];
    if (user) {
      user.customLimit = numLimit;
      updates.push(user.save());
    }

    if (cleanPhone) {
      updates.push(
        GuestDeviceTracking.updateMany({ phoneNumber: cleanPhone }, { customLimit: numLimit }),
        CrmLead.findOneAndUpdate(
          { phoneNumber: cleanPhone },
          { $set: { customLimit: numLimit } },
          { upsert: true }
        )
      );
    } else if (idOrPhone) {
      updates.push(
        GuestDeviceTracking.updateMany({ deviceId: idOrPhone }, { customLimit: numLimit })
      );
    }

    await Promise.all(updates);

    return {
      success: true,
      customLimit: numLimit,
      message: `ফ্রি নম্বর দেখার লিমিট সফলভাবে ${numLimit}টিতে উন্নীত করা হয়েছে!`,
    };
  }

  /**
   * Get CRM Leads list
   */
  async getCrmLeads({ filter, page = 1, limit = 50 }) {
    const query = {};
    const startOfToday = this.getStartOfTodayBST();
    const endOfToday = new Date(startOfToday.getTime() + 24 * 3600 * 1000 - 1);

    if (filter === 'today') {
      query.nextFollowUpDate = { $lte: endOfToday };
    } else if (filter === 'urgent') {
      query.priority = { $in: ['URGENT', 'HIGH'] };
    } else if (filter === 'pending') {
      query.leadStatus = { $in: ['INTERESTED', 'PAYMENT_PENDING'] };
    }

    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const [total, leads] = await Promise.all([
      CrmLead.countDocuments(query),
      CrmLead.find(query)
        .sort({ nextFollowUpDate: 1, updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
    ]);

    return {
      leads,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)) || 1,
      },
    };
  }

  /**
   * Toggle user paid status
   */
  async toggleUserPaid(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('ইউজার পাওয়া যায়নি');

    const currentMonthYear = paymentService.getCurrentMonthYear();
    const newStatus = !user.isPaid;

    user.isPaid = newStatus;
    if (newStatus) {
      user.paidMonth = currentMonthYear;
      user.paidUntil = this.getEndOfMonthBST();
    } else {
      user.paidMonth = null;
      user.paidUntil = null;
    }
    await user.save();

    return {
      success: true,
      isPaid: user.isPaid,
      message: `${user.phoneNumber} এর পেইড স্ট্যাটাস ${user.isPaid ? 'সক্রিয় (PAID)' : 'বন্ধ (FREE)'} করা হয়েছে`,
    };
  }

  /**
   * Reset user password
   */
  async resetUserPassword(userId, newPassword = '123456') {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new Error('ইউজার পাওয়া যায়নি');

    user.password = newPassword;
    await user.save();

    return {
      success: true,
      newPassword,
      message: `${user.phoneNumber} এর পাসওয়ার্ড সফলভাবে রিসেট করে '${newPassword}' করা হয়েছে`,
    };
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('ইউজার পাওয়া যায়নি');
    if (user.role === 'bachelor_admin' || user.phoneNumber === '01306070598') {
      throw new Error('এডমিন একাউন্ট ডিলেট করা যাবে না');
    }
    await User.findByIdAndDelete(userId);
    return {
      success: true,
      message: `${user.phoneNumber} (${user.name}) একাউন্টটি সফলভাবে ডিলেট করা হয়েছে`,
    };
  }

  /**
   * Property Management: Search & filter properties
   */
  async getAllProperties({ search, filter, page = 1, limit = 50 }) {
    const query = {};

    if (filter === 'active') {
      query.isActive = true;
    } else if (filter === 'hidden') {
      query.isActive = false;
    }

    if (search && search.trim()) {
      const term = search.trim();
      const orClauses = [
        { title: { $regex: term, $options: 'i' } },
        { area: { $regex: term, $options: 'i' } },
        { subArea: { $regex: term, $options: 'i' } },
        { contactPhone: { $regex: term, $options: 'i' } },
        { landlordPhone: { $regex: term, $options: 'i' } },
      ];
      if (/^\d+$/.test(term)) {
        orClauses.push({ propertyCode: term });
      }
      query.$and = query.$and || [];
      query.$and.push({ $or: orClauses });
    }

    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const [total, properties] = await Promise.all([
      Property.countDocuments(query),
      Property.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select(
          'propertyCode title description area subArea rentPrice contactPhone landlordPhone landlordName isActive isVerified createdAt alreadyRentedReportCount'
        )
        .lean(),
    ]);

    return {
      properties,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)) || 1,
      },
    };
  }

  /**
   * Toggle property active/hide
   */
  async togglePropertyActive(propertyId) {
    const prop = await Property.findById(propertyId);
    if (!prop) throw new Error('বিজ্ঞাপন পাওয়া যায়নি');

    prop.isActive = !prop.isActive;
    await prop.save();

    return {
      success: true,
      isActive: prop.isActive,
      message: `বিজ্ঞাপন #${prop.propertyCode || prop._id} এখন ${prop.isActive ? 'সক্রিয় (অ্যাপে দৃশ্যমান)' : 'হাইড/লুকানো (অ্যাপে অদৃশ্য)'}`,
    };
  }

  /**
   * Delete property
   */
  async deleteProperty(propertyId) {
    const prop = await Property.findById(propertyId);
    if (!prop) throw new Error('বিজ্ঞাপনটি পাওয়া যায়নি');

    await Property.findByIdAndDelete(propertyId);
    await PropertyReport.deleteMany({ propertyId });

    return {
      success: true,
      message: `বিজ্ঞাপন #${prop.propertyCode || prop._id} সফলভাবে ডিলেট করা হয়েছে`,
    };
  }

  /**
   * Reports Management: Get all property reports
   */
  async getReports() {
    const reports = await PropertyReport.find()
      .sort({ createdAt: -1 })
      .populate('propertyId', 'propertyCode title area subArea rentPrice contactPhone landlordPhone isActive')
      .populate('userId', 'name phoneNumber')
      .lean();

    return reports;
  }

  /**
   * Resolve a report (mark rented or dismiss)
   */
  async resolveReport(reportId, action) {
    const report = await PropertyReport.findById(reportId);
    if (!report) throw new Error('রিপোর্ট পাওয়া যায়নি');

    if (action === 'RENTED') {
      report.status = 'RESOLVED';
      report.resolvedAt = new Date();
      await report.save();
      if (report.propertyId) {
        await Property.findByIdAndUpdate(report.propertyId, { isActive: false });
      }
      return {
        success: true,
        message: 'বাসাটি সফলভাবে "ভাড়া হয়ে গেছে" মার্ক করা হয়েছে এবং অ্যাপ থেকে হাইড করা হয়েছে',
      };
    } else {
      report.status = 'DISMISSED';
      report.resolvedAt = new Date();
      await report.save();
      return {
        success: true,
        message: 'রিপোর্টটি বাতিল (Dismissed) করা হয়েছে',
      };
    }
  }

  /**
   * App Configuration
   */
  async getAppConfig() {
    await paymentService.loadConfig();
    let config = await AppConfig.findOne({ key: 'main_config' });
    if (!config) {
      config = await AppConfig.create({ key: 'main_config' });
    }
    return config;
  }

  async updateAppConfig(data) {
    const allowed = [
      'appMode',
      'bKashNumber',
      'nagadNumber',
      'whatsAppNumber',
      'feeAmount',
      'freeGuestLimit',
      'adminPasskey',
      'noticeBanner',
    ];
    const update = {};
    for (const key of allowed) {
      if (data[key] !== undefined) {
        update[key] = data[key];
      }
    }

    const updated = await AppConfig.findOneAndUpdate(
      { key: 'main_config' },
      { $set: update },
      { upsert: true, new: true }
    );

    paymentService.setCachedConfig(updated.toObject());

    return {
      success: true,
      config: updated,
      message: 'অ্যাপ কনফিগারেশন সফলভাবে আপডেট হয়েছে',
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

    const userResult = await paymentService.activateOrRegisterPaidUser(cleanPhone, monthYear);
    fakeSms.claimedByUserId = userResult.user._id || userResult.user.id;
    await fakeSms.save();

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

  /**
   * Helper to resolve distinct FCM tokens by audience filter
   */
  async _resolveAudienceTokens(targetAudience = 'ALL', specificPhone = null) {
    const tokens = new Set();

    if (targetAudience === 'SPECIFIC_PHONE' && specificPhone) {
      const cleanPhone = String(specificPhone).trim();
      const user = await User.findOne({ phoneNumber: cleanPhone }).select('fcmToken _id').lean();
      if (user?.fcmToken) tokens.add(user.fcmToken);

      // Check linked device trackings and user interests
      const gTrackings = await GuestDeviceTracking.find({ phoneNumber: cleanPhone }).select('deviceId').lean();
      const deviceIds = gTrackings.map((g) => g.deviceId).filter(Boolean);
      const orConditions = [{ phoneNumber: cleanPhone }];
      if (user?._id) orConditions.push({ userId: user._id });
      if (deviceIds.length) orConditions.push({ deviceId: { $in: deviceIds } });

      const interests = await UserInterest.find({ $or: orConditions }).select('fcmToken').lean();
      interests.forEach((i) => {
        if (i.fcmToken) tokens.add(i.fcmToken);
      });

      return Array.from(tokens).filter(Boolean);
    }

    if (targetAudience === 'ALL') {
      const [userTokens, interestTokens] = await Promise.all([
        User.find({ fcmToken: { $ne: null, $exists: true } }).select('fcmToken').lean(),
        UserInterest.find({ fcmToken: { $ne: null, $exists: true } }).select('fcmToken').lean(),
      ]);
      userTokens.forEach((u) => { if (u.fcmToken) tokens.add(u.fcmToken); });
      interestTokens.forEach((i) => { if (i.fcmToken) tokens.add(i.fcmToken); });
      return Array.from(tokens).filter(Boolean);
    }

    if (targetAudience === 'TODAY') {
      const now = new Date();
      const startOfDayBST = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), -6, 0, 0, 0));
      const todayUsers = await User.find({ createdAt: { $gte: startOfDayBST } }).select('fcmToken _id').lean();
      const todayUserIds = todayUsers.map((u) => u._id);
      todayUsers.forEach((u) => { if (u.fcmToken) tokens.add(u.fcmToken); });

      const todayInterests = await UserInterest.find({
        $or: [{ userId: { $in: todayUserIds } }, { updatedAt: { $gte: startOfDayBST } }],
      })
        .select('fcmToken')
        .lean();
      todayInterests.forEach((i) => { if (i.fcmToken) tokens.add(i.fcmToken); });
      return Array.from(tokens).filter(Boolean);
    }

    if (targetAudience === 'LIMIT_REACHED') {
      const limitDevices = await GuestDeviceTracking.find({ count: { $gte: 3 }, isPaid: { $ne: true } }).lean();
      const limitPhones = limitDevices.map((d) => d.phoneNumber).filter(Boolean);
      const limitDeviceIds = limitDevices.map((d) => d.deviceId).filter(Boolean);

      const [limitUsers, limitInterests] = await Promise.all([
        User.find({ $or: [{ phoneNumber: { $in: limitPhones } }, { isPaid: false }] }).select('fcmToken').lean(),
        UserInterest.find({ deviceId: { $in: limitDeviceIds } }).select('fcmToken').lean(),
      ]);

      limitUsers.forEach((u) => { if (u.fcmToken) tokens.add(u.fcmToken); });
      limitInterests.forEach((i) => { if (i.fcmToken) tokens.add(i.fcmToken); });
      return Array.from(tokens).filter(Boolean);
    }

    if (targetAudience === 'PAID') {
      const paidUsers = await User.find({ isPaid: true }).select('fcmToken').lean();
      paidUsers.forEach((u) => { if (u.fcmToken) tokens.add(u.fcmToken); });
      return Array.from(tokens).filter(Boolean);
    }

    if (targetAudience === 'UNPAID') {
      const unpaidUsers = await User.find({ isPaid: { $ne: true } }).select('fcmToken').lean();
      unpaidUsers.forEach((u) => { if (u.fcmToken) tokens.add(u.fcmToken); });
      return Array.from(tokens).filter(Boolean);
    }

    return Array.from(tokens).filter(Boolean);
  }

  /**
   * Calculate audience token count based on filter
   */
  async getAudienceCount(targetAudience = 'ALL', specificPhone = null) {
    const tokens = await this._resolveAudienceTokens(targetAudience, specificPhone);
    return {
      targetAudience,
      specificPhone,
      tokenCount: tokens.length,
      isFirebaseActive: isFirebaseInitialized(),
    };
  }

  /**
   * Send Broadcast Push Notification
   */
  async sendBroadcastPushNotification({ title, body, targetAudience = 'ALL', specificPhone = null, adminName = 'Admin' }) {
    if (!title || !title.trim()) throw new Error('নোটিফিকেশনের শিরোনাম (Title) দিন');
    if (!body || !body.trim()) throw new Error('নোটিফিকেশনের বিবরণ (Body) দিন');

    const cleanTitle = title.trim();
    const cleanBody = body.trim();

    const tokens = await this._resolveAudienceTokens(targetAudience, specificPhone);
    if (!tokens.length) {
      throw new Error('এই ফিল্টারে কোনো সক্রিয় ডিভাইসের পুশ টোকেন পাওয়া যায়নি');
    }

    let successCount = 0;
    let failedCount = 0;

    // Send with concurrency control (10 at a time)
    const BATCH_SIZE = 10;
    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
      const chunk = tokens.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        chunk.map((tok) =>
          sendFcmPushNotification({
            token: tok,
            title: cleanTitle,
            body: cleanBody,
            data: {
              type: 'ADMIN_BROADCAST',
              targetAudience,
              click_action: 'FLUTTER_NOTIFICATION_CLICK',
            },
          })
        )
      );

      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value?.success) {
          successCount++;
        } else {
          failedCount++;
        }
      });
    }

    // Save Push Log
    const log = await PushLog.create({
      title: cleanTitle,
      body: cleanBody,
      targetAudience,
      specificPhone: targetAudience === 'SPECIFIC_PHONE' ? specificPhone : null,
      targetCount: tokens.length,
      successCount,
      failedCount,
      sentBy: adminName,
    });

    return {
      logId: log._id,
      targetAudience,
      targetCount: tokens.length,
      successCount,
      failedCount,
      isFirebaseActive: isFirebaseInitialized(),
      message: `${tokens.length}টি টার্গেট ডিভাইসের মধ্যে ${successCount}টিতে নোটিফিকেশন সফলভাবে পাঠানো হয়েছে`,
    };
  }

  /**
   * Get push notification history logs
   */
  async getPushLogs({ page = 1, limit = 15 } = {}) {
    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const [total, logs] = await Promise.all([
      PushLog.countDocuments(),
      PushLog.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
    ]);

    return {
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)) || 1,
      },
    };
  }
}

module.exports = new AdminService();
