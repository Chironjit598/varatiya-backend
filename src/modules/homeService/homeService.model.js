const mongoose = require('mongoose');

const homeServiceBookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: {
      type: String,
      required: [true, 'গ্রাহকের নাম আবশ্যক'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'মোবাইল নম্বর আবশ্যক'],
      trim: true,
    },
    // একাধিক সার্ভিসের তালিকা (Multi-Service Support)
    selectedServices: [
      {
        category: { type: String, required: true }, // shifting, electrician, fridge_ac, gas_plumbing
        categoryBn: { type: String, default: '' },
        subTypes: { type: [String], default: [] },
        subTypesBn: { type: [String], default: [] },
        helpersCount: { type: Number, default: 0 },
        details: { type: String, default: '' },
      },
    ],
    // ব্যাকওয়ার্ড কম্প্যাটিবিলিটির জন্য সিঙ্গেল সার্ভিস ফিল্ড
    serviceCategory: {
      type: String,
      default: 'shifting',
    },
    serviceCategoryBn: {
      type: String,
      default: '',
    },
    serviceType: {
      type: String,
      default: '',
    },
    serviceTypeBn: {
      type: String,
      default: '',
    },
    pickupLocation: {
      type: String,
      required: [true, 'কাজের ঠিকানা / পিকআপ লোকেশন দিন'],
      trim: true,
    },
    dropLocation: {
      type: String,
      trim: true,
      default: '',
    },
    scheduledDate: {
      type: String,
      required: [true, 'তারিখ উল্লেখ করুন'],
      trim: true,
    },
    scheduledTime: {
      type: String,
      trim: true,
      default: '',
    },
    helpersCount: {
      type: Number,
      default: 0,
    },
    details: {
      type: String,
      trim: true,
      default: '',
    },
    // ডিজিটাল প্রাইস কোটেশন ও নেগোসিয়েশন ফিল্ডস
    quotedPrice: {
      type: Number,
      default: 0,
    },
    priceNote: {
      type: String,
      default: '',
    },
    counterPrice: {
      type: Number,
      default: 0,
    },
    counterNote: {
      type: String,
      default: '',
    },
    counterCount: {
      type: Number,
      default: 0,
    },
    maxCounterRounds: {
      type: Number,
      default: 2,
    },
    isFinalPrice: {
      type: Boolean,
      default: false,
    },
    negotiationStatus: {
      type: String,
      enum: ['pending', 'quoted', 'countered', 'agreed', 'rejected'],
      default: 'pending',
    },
    // রিয়েল-টাইম অ্যাক্টিভিটি টাইমলাইন (Live Updates Feed)
    timeline: [
      {
        title: { type: String, required: true },
        message: { type: String, required: true },
        time: { type: Date, default: Date.now },
        status: { type: String, default: 'info' },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    assignedProvider: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      notes: { type: String, default: '' },
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

homeServiceBookingSchema.index({ phone: 1, createdAt: -1 });
homeServiceBookingSchema.index({ user: 1, createdAt: -1 });
homeServiceBookingSchema.index({ status: 1, createdAt: -1 });
homeServiceBookingSchema.index({ negotiationStatus: 1, createdAt: -1 });

module.exports = mongoose.model('HomeServiceBooking', homeServiceBookingSchema);
