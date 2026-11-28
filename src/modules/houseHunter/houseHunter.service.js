const HouseHunterRequest = require('./houseHunter.model');

class HouseHunterService {
  /**
   * Submit a new House Hunter request (from User Mobile App)
   */
  async submitRequest(data, user = null) {
    const cleanPhone = String(data.phone || '').replace(/[^\d]/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      const err = new Error('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন');
      err.statusCode = 400;
      throw err;
    }

    // Format target areas (support both array and legacy single string)
    let targetAreas = [];
    if (Array.isArray(data.targetAreas) && data.targetAreas.length > 0) {
      targetAreas = data.targetAreas.map((a) => String(a).trim()).filter(Boolean);
    } else if (data.targetArea || data.area) {
      targetAreas = [String(data.targetArea || data.area).trim()];
    }

    let targetSubAreas = [];
    if (Array.isArray(data.targetSubAreas) && data.targetSubAreas.length > 0) {
      targetSubAreas = data.targetSubAreas.map((s) => String(s).trim()).filter(Boolean);
    } else if (data.targetSubArea || data.subArea) {
      targetSubAreas = [String(data.targetSubArea || data.subArea).trim()];
    }

    const hasPayment = Boolean(data.senderPhone || data.paymentTrxId || data.trxId || data.status === 'PAID_ACTIVE');
    const paymentTrxId = String(data.paymentTrxId || data.trxId || data.senderPhone || '').trim();

    const payload = {
      name: (data.name || 'ব্যবহারকারী').trim(),
      phone: cleanPhone,
      targetArea: targetAreas.length > 0 ? targetAreas.join(', ') : 'ঢাকা',
      targetAreas,
      targetSubArea: targetSubAreas.length > 0 ? targetSubAreas.join(', ') : '',
      targetSubAreas,
      customLocationNote: (data.customLocationNote || data.detailedAddress || '').trim(),
      occupantsCount: Math.max(1, parseInt(data.occupantsCount, 10) || 1),
      budgetMin: Number(data.budgetMin) || 0,
      budgetMax: Number(data.budgetMax) || 15000,
      tenantType: data.tenantType || 'Family',
      bedrooms: Number(data.bedrooms) || 2,
      bathrooms: Number(data.bathrooms) || 2,
      desiredMoveDate: (data.desiredMoveDate || 'চলতি মাস থেকে').trim(),
      specialRequirements: (data.specialRequirements || data.notes || '').trim(),
      feeAmount: 1000,
      status: hasPayment ? 'PAID_ACTIVE' : (data.status || 'PENDING'),
      paymentTrxId: hasPayment ? paymentTrxId : '',
      paidAt: hasPayment ? new Date() : null,
      user: user?._id || user?.id || null,
    };

    const doc = await HouseHunterRequest.create(payload);
    return doc;
  }

  /**
   * Submit payment for a House Hunter request
   */
  async submitPayment(requestId, paymentData, user = null) {
    const doc = await HouseHunterRequest.findById(requestId);
    if (!doc) {
      const err = new Error('অনুরোধটি খুঁজে পাওয়া যায়নি');
      err.statusCode = 404;
      throw err;
    }

    const senderPhone = String(paymentData.senderPhone || paymentData.phone || '').trim();
    const trxId = String(paymentData.trxId || paymentData.paymentTrxId || '').trim();

    doc.paymentTrxId = trxId || senderPhone;
    doc.status = 'PAID_ACTIVE';
    doc.paidAt = new Date();
    if (user && !doc.user) {
      doc.user = user._id || user.id;
    }
    await doc.save();

    return doc;
  }

  /**
   * Get user's own requests
   */
  async getMyRequests(phone, userId = null) {
    const query = {};
    const conditions = [];

    if (userId) {
      conditions.push({ user: userId });
    }
    if (phone) {
      const cleanPhone = String(phone).replace(/[^\d]/g, '');
      if (cleanPhone) {
        conditions.push({ phone: cleanPhone });
      }
    }

    if (!conditions.length) {
      return [];
    }

    query.$or = conditions;
    return HouseHunterRequest.find(query).sort({ createdAt: -1 }).lean();
  }

  /**
   * Admin: Get all requests with filters & pagination
   */
  async getAllRequestsAdmin({ page = 1, limit = 20, status = '', search = '' } = {}) {
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      const term = search.trim();
      const or = [
        { name: { $regex: term, $options: 'i' } },
        { phone: { $regex: term, $options: 'i' } },
        { targetArea: { $regex: term, $options: 'i' } },
        { targetSubArea: { $regex: term, $options: 'i' } },
        { customLocationNote: { $regex: term, $options: 'i' } },
        { assignedAgent: { $regex: term, $options: 'i' } },
      ];
      query.$and = query.$and || [];
      query.$and.push({ $or: or });
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [total, requests] = await Promise.all([
      HouseHunterRequest.countDocuments(query),
      HouseHunterRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    return {
      requests,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  /**
   * Admin: Update status / notes / agent
   */
  async updateRequestAdmin(id, updates) {
    const doc = await HouseHunterRequest.findById(id);
    if (!doc) {
      const err = new Error('অনুরোধটি পাওয়া যায়নি');
      err.statusCode = 404;
      throw err;
    }

    const updatable = [
      'status',
      'assignedAgent',
      'adminNotes',
      'paymentTrxId',
      'specialRequirements',
      'budgetMin',
      'budgetMax',
      'bedrooms',
      'bathrooms',
      'desiredMoveDate',
    ];

    updatable.forEach((f) => {
      if (updates[f] !== undefined) {
        doc[f] = updates[f];
      }
    });

    if (updates.status === 'PAID_ACTIVE' && !doc.paidAt) {
      doc.paidAt = new Date();
    }

    await doc.save();
    return doc;
  }

  /**
   * Admin: Delete request
   */
  async deleteRequestAdmin(id) {
    const doc = await HouseHunterRequest.findByIdAndDelete(id);
    if (!doc) {
      const err = new Error('অনুরোধটি পাওয়া যায়নি');
      err.statusCode = 404;
      throw err;
    }
    return { success: true, message: 'অনুরোধটি মুছে ফেলা হয়েছে' };
  }
}

module.exports = new HouseHunterService();

