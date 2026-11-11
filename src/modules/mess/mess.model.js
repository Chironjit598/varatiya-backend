const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    seatNumber: { type: Number, required: true },
    isBooked: { type: Boolean, default: false },
    occupantName: { type: String, default: null },
    occupantPhone: { type: String, default: null },
    bookedAt: { type: Date, default: null },
    rentAmount: { type: Number, default: null },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    roomType: {
      type: String,
      enum: ['single', 'two_bed', 'three_bed', 'four_bed', 'five_bed'],
      default: 'single',
    },
    roomNumber: { type: Number, required: true },
    roomName: { type: String, required: true },
    seats: { type: [seatSchema], default: [] },
  },
  { _id: false }
);

const utilityBillSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    amount: { type: Number, default: 0 },
  },
  { _id: false }
);

const sharedBillSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['wifi', 'gas', 'water', 'electricity', 'maid', 'waste', 'other'],
      default: 'other',
    },
    amount: { type: Number, required: true },
    month: { type: String, default: 'নভেম্বর ২০২৬' },
    dateAdded: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const noticeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    postedBy: { type: String, default: 'মেস ম্যানেজার' },
    postedAt: { type: Date, default: Date.now },
    isUrgent: { type: Boolean, default: false },
  },
  { _id: false }
);

const messMemberSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    role: {
      type: String,
      default: 'border',
    },
    roles: {
      type: [String],
      default: ['border'],
    },
    isAdmin: { type: Boolean, default: false },
    isManager: { type: Boolean, default: false },
    totalMealsConsumed: { type: Number, default: 0 },
    totalMoneyDeposited: { type: Number, default: 0 },
    paidRent: { type: Number, default: 0 },
    paidUtility: { type: Number, default: 0 },
    paidDevelopmentFee: { type: Number, default: 0 },
    todayMealSlots: { type: [Boolean], default: [true, true] },
    customDateSlots: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const bazarRosterScheduleSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    dayNumber: { type: Number, required: true, min: 1, max: 31 },
    date: { type: String, default: '' }, // e.g. '2026-11-01'
    memberIds: { type: [String], default: [] },
    memberNames: { type: [String], default: [] },
    note: { type: String, default: '' },
    isCompleted: { type: Boolean, default: false },
    notificationSent: { type: Boolean, default: false },
  },
  { _id: false }
);

const bazarRosterSchema = new mongoose.Schema(
  {
    month: { type: String, default: 'নভেম্বর ২০২৬' },
    note: { type: String, default: '' },
    schedule: { type: [bazarRosterScheduleSchema], default: [] },
  },
  { _id: false }
);

const cleaningRosterScheduleSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    dayNumber: { type: Number, required: true, min: 1, max: 31 },
    date: { type: String, default: '' }, // e.g. '2026-11-01'
    memberIds: { type: [String], default: [] },
    memberNames: { type: [String], default: [] },
    cleaningArea: { type: String, default: 'টয়লেট ও বেসিন' },
    note: { type: String, default: '' },
    isCompleted: { type: Boolean, default: false },
    notificationSent: { type: Boolean, default: false },
  },
  { _id: false }
);

const cleaningRosterSchema = new mongoose.Schema(
  {
    month: { type: String, default: 'নভেম্বর ২০২৬' },
    note: { type: String, default: '' },
    schedule: { type: [cleaningRosterScheduleSchema], default: [] },
  },
  { _id: false }
);

const developmentFundFeeSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    memberId: { type: String, default: '' },
    memberName: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    month: { type: String, default: '' },
    paidAt: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const developmentFundExpenseSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    title: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    note: { type: String, default: '' },
    recordedBy: { type: String, default: 'মেস কন্ট্রোলার' },
  },
  { _id: false }
);

const developmentFundSchema = new mongoose.Schema(
  {
    monthlyFeePerMember: { type: Number, default: 0 },
    collections: { type: [developmentFundFeeSchema], default: [] },
    expenses: { type: [developmentFundExpenseSchema], default: [] },
  },
  { _id: false }
);

const bazarItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: String, default: '' },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

const bazarEntrySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    buyerMemberId: { type: String, required: true },
    buyerMemberName: { type: String, required: true },
    date: { type: Date, default: Date.now },
    totalAmount: { type: Number, required: true },
    items: { type: [bazarItemSchema], default: [] },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const mealRequestSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    memberId: { type: String, required: true },
    memberName: { type: String, required: true },
    date: { type: Date, required: true },
    slotIndex: { type: Number, required: true },
    slotName: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    note: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const mealConfigSchema = new mongoose.Schema(
  {
    messName: { type: String, default: '' },
    mealsPerDay: { type: Number, enum: [2, 3], default: 2 },
    slotNames: {
      type: [String],
      default: ['দুপুর (Lunch)', 'রাত (Dinner)'],
    },
    managerId: { type: String, default: '' },
    managerName: { type: String, default: '' },
    currentMonth: { type: String, default: 'নভেম্বর ২০২৬' },
  },
  { _id: false }
);

const managedMessSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
      index: true,
    },
    operatingMode: {
      type: String,
      enum: ['student_shared', 'dhaka_centralized', 'bachelor_flat'],
      default: 'dhaka_centralized',
    },
    bazarRoster: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ month: 'নভেম্বর ২০২৬', note: '', schedule: [] }),
    },
    bazarRosters: {
      type: [bazarRosterSchema],
      default: [],
    },
    cleaningRoster: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ month: 'নভেম্বর ২০২৬', note: '', schedule: [] }),
    },
    cleaningRosters: {
      type: [cleaningRosterSchema],
      default: [],
    },
    developmentFund: {
      type: developmentFundSchema,
      default: () => ({
        monthlyFeePerMember: 0,
        collections: [],
        expenses: [],
      }),
    },
    name: {
      type: String,
      required: [true, 'মেসের নাম আবশ্যক'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'মেসের ঠিকানা আবশ্যক'],
      trim: true,
    },
    area: {
      type: String,
      required: [true, 'এলাকা আবশ্যক'],
      trim: true,
      index: true,
    },
    managerId: {
      type: String,
      required: true,
      index: true,
    },
    managerName: {
      type: String,
      default: '',
    },
    managerPhone: {
      type: String,
      default: '',
    },
    defaultSeatRent: {
      type: Number,
      default: 3000,
    },
    singleBedRooms: { type: Number, default: 0 },
    twoBedRooms: { type: Number, default: 0 },
    threeBedRooms: { type: Number, default: 0 },
    fourBedRooms: { type: Number, default: 0 },
    fiveBedRooms: { type: Number, default: 0 },
    totalSeats: { type: Number, default: 0 },
    vacantSeats: { type: Number, default: 0 },
    rooms: { type: [roomSchema], default: [] },
    isUtilitySeparate: { type: Boolean, default: false },
    utilityBills: { type: [utilityBillSchema], default: [] },
    showUtilityAmountToSeekers: { type: Boolean, default: true },
    sharedBills: { type: [sharedBillSchema], default: [] },
    notices: { type: [noticeSchema], default: [] },
    members: { type: [messMemberSchema], default: [] },
    bazarEntries: { type: [bazarEntrySchema], default: [] },
    mealRequests: { type: [mealRequestSchema], default: [] },
    mealConfig: {
      type: mealConfigSchema,
      default: () => ({
        messName: '',
        mealsPerDay: 2,
        managerId: '',
        managerName: '',
        currentMonth: 'নভেম্বর ২০২৬',
      }),
    },
  },
  {
    timestamps: true,
    collection: 'managed_messes',
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const ManagedMess = mongoose.model('ManagedMess', managedMessSchema);

module.exports = ManagedMess;

