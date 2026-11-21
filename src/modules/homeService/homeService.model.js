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
    serviceCategory: {
      type: String,
      required: [true, 'সার্ভিস ক্যাটাগরি নির্বাচন করুন'],
      enum: ['shifting', 'electrician', 'fridge_ac', 'gas_plumbing', 'other'],
    },
    serviceCategoryBn: {
      type: String,
      default: '',
    },
    serviceType: {
      type: String,
      required: [true, 'সার্ভিসের ধরন উল্লেখ করুন'],
      trim: true,
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
    estimatedPrice: {
      type: Number,
      default: 0,
    },
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

module.exports = mongoose.model('HomeServiceBooking', homeServiceBookingSchema);
