const mongoose = require('mongoose');

const appConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'main_config',
      unique: true,
      index: true,
    },
    appMode: {
      type: String,
      enum: ['LIVE', 'REVIEW'],
      default: 'LIVE',
    },
    bKashNumber: {
      type: String,
      default: '01306070598',
      trim: true,
    },
    nagadNumber: {
      type: String,
      default: '01306070598',
      trim: true,
    },
    whatsAppNumber: {
      type: String,
      default: '01726228790',
      trim: true,
    },
    feeAmount: {
      type: Number,
      default: 50,
    },
    freeGuestLimit: {
      type: Number,
      default: 3,
    },
    adminPasskey: {
      type: String,
      default: '5980',
      trim: true,
    },
    noticeBanner: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AppConfig', appConfigSchema);

