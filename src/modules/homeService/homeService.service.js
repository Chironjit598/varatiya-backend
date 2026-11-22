const HomeServiceBooking = require('./homeService.model');
const Notification = require('../notification/notification.model');

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

    // প্রাথমিক লাইভ টাইমলাইন
    bookingData.timeline = [
      {
        title: 'অনুরোধ গৃহীত হয়েছে',
        message: 'আপনার সেবাসমূহের অনুরোধ আমাদের সিস্টেমে সফলভাবে জমা হয়েছে।',
        time: new Date(),
        status: 'received',
      },
      {
        title: 'দরদাম ও যাচাই চলছে',
        message: 'আপনি একটু সক্রিয় (Active) থাকুন! আমাদের টিম আপনার এলাকার বিশ্বস্ত সার্ভিস প্রোভাইডারদের সাথে সাশ্রয়ী রেটে আলোচনা করছে। কিছুক্ষণের মধ্যেই অ্যাপে আপনার মোট খরচ জানিয়ে দেওয়া হবে।',
        time: new Date(),
        status: 'negotiating',
      },
    ];

    const booking = await HomeServiceBooking.create(bookingData);

    // ইন-অ্যাপ নোটিফিকেশন পাঠানো (ইউজার থাকলে)
    if (booking.user) {
      try {
        await Notification.create({
          userId: booking.user,
          title: 'সেবা অনুরোধ গ্রহণ করা হয়েছে',
          body: 'আপনার বাসা বদল ও হোম সার্ভিস অনুরোধটি সফলভাবে গৃহীত হয়েছে। কিছুক্ষণের মধ্যে রেট জানিয়ে দেওয়া হবে।',
          type: 'HOME_SERVICE',
          data: {
            action: 'VIEW_BOOKING',
            metadata: { bookingId: booking._id },
          },
        });
      } catch (err) {
        console.error('Failed to create notification for home service booking:', err);
      }
    }

    return booking;
  }

  /**
   * User responds to price quote: Accept or Counter
   */
  async respondToQuote(bookingId, { action, counterPrice, counterNote }) {
    const booking = await HomeServiceBooking.findById(bookingId);
    if (!booking) {
      const err = new Error('বুকিংটি পাওয়া যায়নি');
      err.statusCode = 404;
      throw err;
    }

    if (action === 'accept') {
      booking.negotiationStatus = 'agreed';
      booking.status = 'confirmed';
      booking.timeline.push({
        title: 'রেট নিশ্চিত ও বুকিং সম্পন্ন',
        message: `আপনি প্রস্তাবিত ৳${booking.quotedPrice} রেট গ্রহণ করেছেন। শীঘ্রই দায়িত্বপ্রাপ্ত টিম আপনার সাথে যোগাযোগ করবে।`,
        time: new Date(),
        status: 'agreed',
      });

      if (booking.user) {
        try {
          await Notification.create({
            userId: booking.user,
            title: 'বুকিং নিশ্চিত হয়েছে!',
            body: `আপনার বাসা বদল ও হোম সার্ভিস বুকিং ৳${booking.quotedPrice} মূল্যে নিশ্চিত হয়েছে।`,
            type: 'HOME_SERVICE',
            data: {
              action: 'VIEW_BOOKING',
              metadata: { bookingId: booking._id },
            },
          });
        } catch (err) {
          console.error(err);
        }
      }
    } else if (action === 'counter') {
      const parsedCounter = parseInt(counterPrice, 10) || 0;
      if (parsedCounter <= 0) {
        const err = new Error('সঠিক বাজেট উল্লেখ করুন');
        err.statusCode = 400;
        throw err;
      }

      booking.counterPrice = parsedCounter;
      booking.counterNote = counterNote || '';
      booking.negotiationStatus = 'countered';
      booking.timeline.push({
        title: 'কাউন্টার অফার পাঠানো হয়েছে',
        message: `আপনার প্রস্তাবিত বাজেট (৳${parsedCounter}) আমাদের টিম গ্রহণ করেছে। টিম সার্ভিস প্রোভাইডারদের সাথে পুনরায় আলোচনা করে এই বাজেটে সম্ভব কিনা তা যাচাই করছে।`,
        time: new Date(),
        status: 'countered',
      });

      if (booking.user) {
        try {
          await Notification.create({
            userId: booking.user,
            title: 'বাজেট প্রস্তাব পাঠানো হয়েছে',
            body: `আপনার প্রস্তাবিত বাজেট ৳${parsedCounter} নিয়ে সার্ভিস প্রোভাইডারদের সাথে আলোচনা চলছে।`,
            type: 'HOME_SERVICE',
            data: {
              action: 'VIEW_BOOKING',
              metadata: { bookingId: booking._id },
            },
          });
        } catch (err) {
          console.error(err);
        }
      }
    }

    await booking.save();
    return booking;
  }

  /**
   * Admin quotes price
   */
  async quotePriceAdmin(bookingId, { quotedPrice, priceNote }) {
    const booking = await HomeServiceBooking.findById(bookingId);
    if (!booking) {
      const err = new Error('বুকিংটি পাওয়া যায়নি');
      err.statusCode = 404;
      throw err;
    }

    const price = parseInt(quotedPrice, 10);
    if (!price || price <= 0) {
      const err = new Error('সঠিক মূল্য প্রদান করুন');
      err.statusCode = 400;
      throw err;
    }

    booking.quotedPrice = price;
    booking.priceNote = priceNote || '';
    booking.negotiationStatus = 'quoted';
    booking.timeline.push({
      title: 'মূল্য নির্ধারণ হয়েছে',
      message: `আপনার সেবাসমূহের মোট খরচ ৳${price} নির্ধারণ করা হয়েছে। অফারটি গ্রহণ বা দরদাম করতে পারেন।`,
      time: new Date(),
      status: 'quoted',
    });

    await booking.save();

    if (booking.user) {
      try {
        await Notification.create({
          userId: booking.user,
          title: 'সেবার মূল্য নির্ধারণ হয়েছে',
          body: `আপনার অনুরোধকৃত সেবার মোট খরচ ৳${price} নির্ধারণ করা হয়েছে। অ্যাপে দেখে কনফার্ম করুন।`,
          type: 'HOME_SERVICE',
          data: {
            action: 'VIEW_BOOKING',
            metadata: { bookingId: booking._id },
          },
        });
      } catch (err) {
        console.error(err);
      }
    }

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
    if (updateData.quotedPrice !== undefined) booking.quotedPrice = updateData.quotedPrice;
    if (updateData.negotiationStatus) booking.negotiationStatus = updateData.negotiationStatus;

    await booking.save();
    return booking;
  }
}

module.exports = new HomeServiceService();
