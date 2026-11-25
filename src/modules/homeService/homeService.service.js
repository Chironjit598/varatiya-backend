const HomeServiceBooking = require('./homeService.model');
const Notification = require('../notification/notification.model');
const { emitHomeServiceEvent } = require('../../config/socket');

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

    try {
      emitHomeServiceEvent('home_service:new_booking', booking);
    } catch (socketErr) {
      console.error('[Socket.IO] Error emitting new booking:', socketErr);
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
            body: `আপনার হোম সার্ভিস বুকিং ৳${booking.quotedPrice} মূল্যে নিশ্চিত হয়েছে।`,
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
    } else if (action === 'decline' || action === 'reject') {
      booking.negotiationStatus = 'rejected';
      booking.status = 'cancelled';
      booking.timeline.push({
        title: 'অনুরোধ সমাপ্ত',
        message: 'বাজেট না মেলায় গ্রাহক প্রস্তাবিত অফারটি বাতিল করেছেন।',
        time: new Date(),
        status: 'cancelled',
      });
    } else if (action === 'counter') {
      const parsedCounter = parseInt(counterPrice, 10) || 0;
      if (parsedCounter <= 0) {
        const err = new Error('সঠিক বাজেট উল্লেখ করুন');
        err.statusCode = 400;
        throw err;
      }

      const currentCounter = booking.counterCount || 0;
      const maxRounds = booking.maxCounterRounds || 2;
      if (booking.isFinalPrice || currentCounter >= maxRounds) {
        const err = new Error('সর্বোচ্চ দরদামের সীমা পূর্ণ হয়েছে অথবা এটি চূড়ান্ত সর্বনিম্ন রেট। আর দরদাম করার সুযোগ নেই।');
        err.statusCode = 400;
        throw err;
      }

      if (booking.quotedPrice > 0 && parsedCounter >= booking.quotedPrice) {
        const err = new Error(`কাউন্টার বাজেট অবশ্যই বর্তমান অফার (৳${booking.quotedPrice})-এর চেয়ে কম হতে হবে`);
        err.statusCode = 400;
        throw err;
      }

      booking.counterPrice = parsedCounter;
      booking.counterNote = counterNote || '';
      booking.counterCount = currentCounter + 1;
      booking.negotiationStatus = 'countered';
      booking.timeline.push({
        title: `কাউন্টার অফার (${booking.counterCount}/${maxRounds})`,
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

    try {
      emitHomeServiceEvent('home_service:negotiation_updated', booking);
    } catch (socketErr) {
      console.error('[Socket.IO] Error emitting negotiation update:', socketErr);
    }

    return booking;
  }

  /**
   * Admin quotes price
   */
  async quotePriceAdmin(bookingId, { quotedPrice, priceNote, isFinalPrice }) {
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

    const currentCounter = booking.counterCount || 0;
    const maxRounds = booking.maxCounterRounds || 2;
    const reachedMaxRounds = currentCounter >= maxRounds;
    const shouldBeFinal = Boolean(isFinalPrice) || reachedMaxRounds;

    booking.isFinalPrice = shouldBeFinal;
    booking.negotiationStatus = 'quoted';
    booking.timeline.push({
      title: shouldBeFinal ? 'চূড়ান্ত সর্বনিম্ন রেট নির্ধারণ' : 'মূল্য নির্ধারণ হয়েছে',
      message: shouldBeFinal
        ? `প্রোভাইডারদের সর্বনিম্ন ও চূড়ান্ত খরচ ৳${price} নির্ধারণ করা হয়েছে। আর কোনো দরদাম করার সুযোগ নেই, অফারটি গ্রহণ বা বাতিল করতে পারেন।`
        : `আপনার সেবাসমূহের মোট খরচ ৳${price} নির্ধারণ করা হয়েছে। অফারটি গ্রহণ বা দরদাম করতে পারেন।`,
      time: new Date(),
      status: 'quoted',
    });

    await booking.save();

    if (booking.user) {
      try {
        await Notification.create({
          userId: booking.user,
          title: shouldBeFinal ? 'চূড়ান্ত মূল্য নির্ধারিত হয়েছে' : 'সেবার মূল্য নির্ধারণ হয়েছে',
          body: shouldBeFinal
            ? `আপনার অনুরোধের চূড়ান্ত সর্বনিম্ন রেট ৳${price} নির্ধারণ করা হয়েছে। গ্রহণ বা বাতিল করতে পারেন।`
            : `আপনার অনুরোধকৃত সেবার মোট খরচ ৳${price} নির্ধারণ করা হয়েছে। অ্যাপে দেখে কনফার্ম করুন।`,
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

    try {
      emitHomeServiceEvent('home_service:quote_updated', booking);
    } catch (socketErr) {
      console.error('[Socket.IO] Error emitting quote update:', socketErr);
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

    if (updateData.status && updateData.status !== booking.status) {
      booking.status = updateData.status;
      if (updateData.status === 'completed') {
        booking.timeline.push({
          title: 'সেবা সম্পন্ন',
          message: 'আপনার হোম সার্ভিসটি সফলভাবে সম্পন্ন হয়েছে। আমাদের সাথে থাকার জন্য ধন্যবাদ!',
          time: new Date(),
          status: 'completed',
        });
      } else if (updateData.status === 'cancelled') {
        booking.timeline.push({
          title: 'বুকিং বাতিল',
          message: 'এডমিন টিম কর্তৃক বুকিংটি বাতিল করা হয়েছে।',
          time: new Date(),
          status: 'cancelled',
        });
      }
    }
    if (updateData.assignedProvider) {
      const prevName = booking.assignedProvider?.name || '';
      const newName = updateData.assignedProvider.name || '';
      booking.assignedProvider = updateData.assignedProvider;
      if (newName && newName !== prevName) {
        booking.timeline.push({
          title: 'টেকনিশিয়ান / ড্রাইভার নির্ধারিত',
          message: `${newName} (${updateData.assignedProvider.phone || 'ফোন উপলব্ধ'})-কে আপনার সেবার দায়িত্ব দেওয়া হয়েছে।`,
          time: new Date(),
          status: 'assigned',
        });
      }
    }
    if (updateData.adminNotes !== undefined) booking.adminNotes = updateData.adminNotes;
    if (updateData.estimatedPrice !== undefined) booking.estimatedPrice = updateData.estimatedPrice;
    if (updateData.quotedPrice !== undefined) booking.quotedPrice = updateData.quotedPrice;
    if (updateData.negotiationStatus) booking.negotiationStatus = updateData.negotiationStatus;

    await booking.save();

    try {
      emitHomeServiceEvent('home_service:status_updated', booking);
    } catch (socketErr) {
      console.error('[Socket.IO] Error emitting status update:', socketErr);
    }

    return booking;
  }

  /**
   * Admin: Delete booking
   */
  async deleteBookingAdmin(id) {
    const booking = await HomeServiceBooking.findByIdAndDelete(id);
    if (!booking) {
      const err = new Error('বুকিংটি পাওয়া যায়নি');
      err.statusCode = 404;
      throw err;
    }
    return { success: true, message: 'বুকিংটি সফলভাবে মুছে ফেলা হয়েছে' };
  }
}

module.exports = new HomeServiceService();
