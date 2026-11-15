const mongoose = require('mongoose');

const incomingSmsSchema = new mongoose.Schema(
  {
    senderNumber: {
      type: String,
      required: [true, 'Sender phone number is required'],
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
      index: true,
    },
    trxId: {
      type: String,
      trim: true,
      default: null,
      sparse: true,
      index: true,
    },
    rawSms: {
      type: String,
      required: [true, 'Raw SMS content is required'],
      trim: true,
    },
    provider: {
      type: String,
      enum: ['BKASH', 'NAGAD', 'ROCKET', 'UPAY', 'UNKNOWN'],
      default: 'BKASH',
      index: true,
    },
    isClaimed: {
      type: Boolean,
      default: false,
      index: true,
    },
    claimedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    claimedAt: {
      type: Date,
      default: null,
    },
    monthYear: {
      type: String,
      required: [true, 'Month-Year is required'],
      index: true, // e.g. '2026-11'
    },
    receivedAt: {
      type: Date,
      default: Date.now,
      index: true,
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
  }
);

// Index to quickly find valid unclaimed SMS from a sender in the current month
incomingSmsSchema.index({ senderNumber: 1, monthYear: 1, isClaimed: 1, amount: 1 });

const IncomingSms = mongoose.model('IncomingSms', incomingSmsSchema);

module.exports = IncomingSms;

