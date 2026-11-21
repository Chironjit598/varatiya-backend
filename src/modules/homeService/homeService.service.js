const HomeServiceBooking = require('./homeService.model');

class HomeServiceService {
  /**
   * Submit a new Home Service / Shifting booking
   */
  async createBooking(data, user = null) {
    const bookingData = {
      ...data,
      user: user ? user._id || user.id : null,
    };

    if (user && !bookingData.phone && user.phoneNumber) {
      bookingData.phone = user.phoneNumber;
    }
    if (user && !bookingData.name && user.fullName) {
      bookingData.name = user.fullName;
    }

    const booking = await HomeServiceBooking.create(bookingData);
    return booking;
  }

  /**
   * Get user's own bookings by phone or userId
   */
  async getMyBookings(phone = '', userId = null) {
    const query = { $or: [] };

    if (userId) {
      query.$or.push({ user: userId });
    }
    if (phone && phone.trim()) {
      const cleanPhone = phone.trim();
      query.$or.push({ phone: cleanPhone });
      query.$or.push({ phone: cleanPhone.replace('+88', '') });
      query.$or.push({ phone: `+88${cleanPhone.replace('+88', '')}` });
    }

    if (query.$or.length === 0) {
      return [];
    }

    return await HomeServiceBooking.find(query).sort({ createdAt: -1 }).lean();
  }

  /**
   * Admin: Get all bookings
   */
  async getAllBookingsAdmin({ page = 1, limit = 20, status, search }) {
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
        { pickupLocation: { $regex: search.trim(), $options: 'i' } },
        { serviceTypeBn: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      HomeServiceBooking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      HomeServiceBooking.countDocuments(filter),
    ]);

    return {
      bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Admin: Update booking status or assign technician/driver
   */
  async updateBookingStatus(id, updateData) {
    const booking = await HomeServiceBooking.findById(id);
    if (!booking) {
      const err = new Error('বুকিংটি পাওয়া যায়নি');
      err.statusCode = 404;
      throw err;
    }

    if (updateData.status) booking.status = updateData.status;
    if (updateData.assignedProvider) booking.assignedProvider = updateData.assignedProvider;
    if (updateData.adminNotes !== undefined) booking.adminNotes = updateData.adminNotes;
    if (updateData.estimatedPrice !== undefined) booking.estimatedPrice = updateData.estimatedPrice;

    await booking.save();
    return booking;
  }
}

module.exports = new HomeServiceService();
