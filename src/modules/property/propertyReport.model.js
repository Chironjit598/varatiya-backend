const mongoose = require('mongoose');

const propertyReportSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: ['ALREADY_RENTED', 'WRONG_NUMBER', 'FAKE_POST', 'OTHER'],
      default: 'ALREADY_RENTED',
      index: true,
    },
    note: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'নোট ৫০০ অক্ষরের বেশি হতে পারবে না'],
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'RESOLVED', 'DISMISSED'],
      default: 'ACTIVE',
      index: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
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

// Prevent duplicate active reports by the same user on the same property
propertyReportSchema.index({ propertyId: 1, userId: 1, status: 1 });

const PropertyReport = mongoose.model('PropertyReport', propertyReportSchema);

module.exports = PropertyReport;
