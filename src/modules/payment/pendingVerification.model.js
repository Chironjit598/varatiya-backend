const mongoose = require('mongoose');

const pendingVerificationSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true,
    },
    monthYear: {
      type: String,
      required: [true, 'Month-Year is required'],
      index: true,
    },
    deviceId: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: ['WAITING', 'MATCHED', 'EXPIRED'],
      default: 'WAITING',
      index: true,
    },
    matchedSmsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IncomingSms',
      default: null,
    },
    matchedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    autoPassword: {
      type: String,
      default: null,
    },
    token: {
      type: String,
      default: null,
    },
    // TTL index: auto delete after 10 minutes if not matched
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // 10 minutes in seconds
    },
  },
  {
    timestamps: true,
  }
);

pendingVerificationSchema.index({ phoneNumber: 1, monthYear: 1, status: 1 });

const PendingVerification = mongoose.model('PendingVerification', pendingVerificationSchema);

module.exports = PendingVerification;

