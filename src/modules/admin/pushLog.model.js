const mongoose = require('mongoose');

const pushLogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    targetAudience: {
      type: String,
      enum: ['ALL', 'TODAY', 'LIMIT_REACHED', 'PAID', 'UNPAID', 'SPECIFIC_PHONE'],
      default: 'ALL',
    },
    specificPhone: {
      type: String,
      default: null,
      trim: true,
    },
    targetCount: {
      type: Number,
      default: 0,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    sentBy: {
      type: String,
      default: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PushLog', pushLogSchema);

