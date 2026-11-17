const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    adminName: { type: String, default: 'Chironjit Roy' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const crmLeadSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    userName: {
      type: String,
      default: '',
      trim: true,
    },
    deviceId: {
      type: String,
      default: null,
      index: true,
    },
    priority: {
      type: String,
      enum: ['URGENT', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
      index: true,
    },
    leadStatus: {
      type: String,
      enum: [
        'NEW',
        'CALLED_TALKED',
        'NO_ANSWER',
        'INTERESTED',
        'PAYMENT_PENDING',
        'CLOSED_RENTED',
        'LOST_NOT_INTERESTED',
      ],
      default: 'NEW',
      index: true,
    },
    nextFollowUpDate: {
      type: Date,
      default: null,
      index: true,
    },
    lastContactedAt: {
      type: Date,
      default: null,
    },
    customLimit: {
      type: Number,
      default: null,
    },
    notes: {
      type: [noteSchema],
      default: [],
    },
    latestNote: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CrmLead', crmLeadSchema);
