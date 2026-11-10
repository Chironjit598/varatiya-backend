const mongoose = require('mongoose');

const paymentRecordSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    messId: {
      type: String,
      required: [true, 'মেস আইডি আবশ্যক (messId is required)'],
      index: true,
    },
    memberId: {
      type: String,
      required: [true, 'মেম্বার আইডি আবশ্যক (memberId is required)'],
      index: true,
    },
    memberName: {
      type: String,
      required: [true, 'মেম্বারের নাম আবশ্যক (memberName is required)'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'টাকার পরিমাণ আবশ্যক (amount is required)'],
      min: [1, 'টাকার পরিমাণ অবশ্যই ধনাত্মক সংখ্যা হতে হবে'],
    },
    category: {
      type: String,
      enum: {
        values: ['meal', 'rent', 'utility'],
        message: 'ক্যাটাগরি শুধুমাত্র meal, rent অথবা utility হতে পারে',
      },
      required: [true, 'পেমেন্ট ক্যাটাগরি আবশ্যক (category is required)'],
    },
    paymentMethod: {
      type: String,
      default: 'cash',
      trim: true,
    },
    collectorId: {
      type: String,
      required: [true, 'কালেক্টর আইডি আবশ্যক (collectorId is required)'],
    },
    collectorName: {
      type: String,
      default: '',
      trim: true,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'payment_records',
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret.id || (ret._id ? ret._id.toString() : undefined);
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        ret.id = ret.id || (ret._id ? ret._id.toString() : undefined);
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for fast lookup
paymentRecordSchema.index({ messId: 1, category: 1 });
paymentRecordSchema.index({ messId: 1, memberId: 1 });

const PaymentRecord = mongoose.model('PaymentRecord', paymentRecordSchema);

module.exports = PaymentRecord;
