const mongoose = require('mongoose');

const memberSheetSchema = new mongoose.Schema(
  {
    memberId: { type: String, required: true },
    memberName: { type: String, required: true },
    phone: { type: String, default: '' },
    role: { type: String, default: 'border' },
    roles: { type: [String], default: ['border'] },
    roleLabel: { type: String, default: 'বর্ডার' },
    assignedRoomName: { type: String, default: null },
    assignedSeatNumber: { type: Number, default: null },
    mealsConsumed: { type: Number, default: 0 },
    mealCost: { type: Number, default: 0 },
    bazarContributed: { type: Number, default: 0 },
    totalMoneyDeposited: { type: Number, default: 0 },
    mealBalance: { type: Number, default: 0 },
    mealStatus: {
      type: String,
      enum: ['receivable', 'payable', 'settled'],
      default: 'settled',
    },
    mealDue: { type: Number, default: 0 },
    seatRent: { type: Number, default: 0 },
    paidRent: { type: Number, default: 0 },
    seatRentDue: { type: Number, default: 0 },
    utilityShare: { type: Number, default: 0 },
    paidUtility: { type: Number, default: 0 },
    utilityDue: { type: Number, default: 0 },
    developmentFee: { type: Number, default: 0 },
    paidDevelopmentFee: { type: Number, default: 0 },
    devFeeDue: { type: Number, default: 0 },
    totalPayable: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    totalDue: { type: Number, default: 0 },
    overallBalance: { type: Number, default: 0 },
  },
  { _id: false }
);

const monthlySheetSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    messId: {
      type: String,
      required: [true, 'মেস আইডি আবশ্যক (messId is required)'],
      index: true,
    },
    messName: {
      type: String,
      default: '',
    },
    monthKey: {
      type: String, // e.g. "2026-11"
      required: true,
      index: true,
    },
    monthLabel: {
      type: String, // e.g. "নভেম্বর ২০২৬"
      required: true,
    },
    operatingMode: {
      type: String,
      enum: ['bachelor_flat', 'student_shared', 'dhaka_centralized'],
      default: 'bachelor_flat',
    },
    operatingModeLabel: {
      type: String,
      default: '',
    },
    totalBazarCost: { type: Number, default: 0 },
    totalMeals: { type: Number, default: 0 },
    mealRate: { type: Number, default: 0 },
    totalExpectedRent: { type: Number, default: 0 },
    totalCollectedRent: { type: Number, default: 0 },
    rentDue: { type: Number, default: 0 },
    totalSharedUtilityBills: { type: Number, default: 0 },
    perBorderUtilityShare: { type: Number, default: 0 },
    totalCollectedUtility: { type: Number, default: 0 },
    utilityDue: { type: Number, default: 0 },
    accountsSummary: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    membersSummary: {
      type: [memberSheetSchema],
      default: [],
    },
    bazarEntriesSnapshot: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    closedBy: {
      type: String,
      default: '',
    },
    closedByName: {
      type: String,
      default: '',
    },
    closedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'monthly_sheets',
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret.__v;
        return ret;
      },
    },
  }
);

monthlySheetSchema.index({ messId: 1, monthKey: 1 }, { unique: true });

const MonthlySheet = mongoose.model('MonthlySheet', monthlySheetSchema);

module.exports = MonthlySheet;
