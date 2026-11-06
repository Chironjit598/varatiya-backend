const mongoose = require('mongoose');

const viewedPropertyItemSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    tenantType: { type: String, default: 'Family' },
    area: { type: String, default: '' },
    subArea: { type: String, default: '' },
    rentPrice: { type: Number, default: 0 },
    isMess: { type: Boolean, default: false },
    viewedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userInterestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true,
      index: true,
    },
    deviceId: {
      type: String,
      sparse: true,
      index: true,
    },
    fcmToken: {
      type: String,
      default: null,
    },
    // Array of viewed properties (capped at last 50)
    viewedProperties: {
      type: [viewedPropertyItemSchema],
      default: [],
    },
    // Dynamically computed interest summary
    summary: {
      primaryTenantType: { type: String, default: '' }, // e.g., 'Bachelor', 'Family', 'Mess'
      primaryArea: { type: String, default: '' },       // e.g., 'Mirpur', 'Dhanmondi'
      primarySubArea: { type: String, default: '' },
      avgBudget: { type: Number, default: 0 },
      minBudget: { type: Number, default: 0 },
      maxBudget: { type: Number, default: 0 },
      totalViews: { type: Number, default: 0 },
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastNotifiedAt: {
      type: Date,
      default: null,
      index: true,
    },
    lastNotifiedPropertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
    },
    notificationCountToday: {
      type: Number,
      default: 0,
    },
    lastNotificationDate: {
      type: String,
      default: '', // 'YYYY-MM-DD'
    },
  },
  {
    timestamps: true,
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

userInterestSchema.index({ lastActiveAt: 1, lastNotifiedAt: 1 });

const UserInterest = mongoose.model('UserInterest', userInterestSchema);

module.exports = UserInterest;
