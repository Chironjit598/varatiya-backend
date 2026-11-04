const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'অ্যালার্টের শিরোনাম আবশ্যক'],
      trim: true,
    },
    area: {
      type: String,
      required: [true, 'এলাকা নির্বাচন করুন'],
      trim: true,
      index: true,
    },
    subArea: {
      type: String,
      trim: true,
      default: '',
    },
    tenantType: {
      type: String,
      required: [true, 'ভাড়াটিয়ার ধরন আবশ্যক'],
      trim: true,
      default: 'Any',
    },
    maxPrice: {
      type: Number,
      required: [true, 'সর্বোচ্চ বাজেট দিন'],
      min: [0, 'সর্বোচ্চ বাজেট ০ বা তার বেশি হতে হবে'],
    },
    isEnabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    matchCount: {
      type: Number,
      default: 0,
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

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;

