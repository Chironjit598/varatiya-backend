const mongoose = require('mongoose');

const houseHunterRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'নাম উল্লেখ করুন'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'মোবাইল নম্বর দিন'],
      trim: true,
    },
    targetArea: {
      type: String,
      trim: true,
      default: '',
    },
    targetAreas: {
      type: [String],
      default: [],
    },
    targetSubArea: {
      type: String,
      trim: true,
      default: '',
    },
    targetSubAreas: {
      type: [String],
      default: [],
    },
    customLocationNote: {
      type: String,
      trim: true,
      default: '',
    },
    occupantsCount: {
      type: Number,
      default: 1,
      min: [1, 'কমপক্ষে ১ জন সদস্য হতে হবে'],
    },
    budgetMin: {
      type: Number,
      default: 0,
    },
    budgetMax: {
      type: Number,
      required: [true, 'সর্বোচ্চ বাজেট উল্লেখ করুন'],
      min: [0, 'বাজেট ০ বা তার বেশি হতে হবে'],
    },
    tenantType: {
      type: String,
      enum: ['Family', 'Bachelor (Male)', 'Bachelor (Female)', 'Any'],
      default: 'Family',
    },
    bedrooms: {
      type: Number,
      default: 2,
    },
    bathrooms: {
      type: Number,
      default: 2,
    },
    desiredMoveDate: {
      type: String,
      required: [true, 'কবে বাসা প্রয়োজন উল্লেখ করুন'],
      trim: true,
    },
    specialRequirements: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'PENDING',        // নতুন রিকোয়েস্ট (অপেক্ষমান)
        'CONTACTED',      // ফোনে যোগাযোগ সম্পন্ন
        'PAID_ACTIVE',    // ১,০০০ টাকা পেমেন্ট নিশ্চিত (টিম মাঠে আছে)
        'HOUSES_SHOWN',   // বাসা দেখানো হয়েছে
        'COMPLETED',      // বাসা চূড়ান্ত সম্পন্ন
        'REFUNDED',       // ৭ দিনের পলিসিতে রিফান্ড করা হয়েছে
        'CANCELLED',      // বাতিল
      ],
      default: 'PENDING',
      index: true,
    },
    feeAmount: {
      type: Number,
      default: 1000,
    },
    paymentTrxId: {
      type: String,
      trim: true,
      default: '',
    },
    paidAt: {
      type: Date,
      default: null,
    },
    assignedAgent: {
      type: String,
      trim: true,
      default: '',
    },
    adminNotes: {
      type: String,
      trim: true,
      default: '',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

houseHunterRequestSchema.index({ phone: 1, createdAt: -1 });
houseHunterRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('HouseHunterRequest', houseHunterRequestSchema);

