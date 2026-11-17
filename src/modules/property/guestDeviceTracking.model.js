const mongoose = require('mongoose');

const guestDeviceTrackingSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, 'Device ID is required'],
      trim: true,
      index: true,
    },
    monthYear: {
      type: String,
      required: [true, 'Month-Year (e.g. 2026-11) is required'],
      trim: true,
      index: true,
    },
    viewedPropertyIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
      },
    ],
    count: {
      type: Number,
      default: 0,
    },
    phoneNumber: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    userName: {
      type: String,
      default: null,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    lastViewedAt: {
      type: Date,
      default: Date.now,
    },
    customLimit: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: 1 record per device per month
guestDeviceTrackingSchema.index({ deviceId: 1, monthYear: 1 }, { unique: true });

const GuestDeviceTracking = mongoose.model('GuestDeviceTracking', guestDeviceTrackingSchema);

module.exports = GuestDeviceTracking;

