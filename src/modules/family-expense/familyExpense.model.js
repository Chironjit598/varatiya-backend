const mongoose = require('mongoose');

const familyExpenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'খরচের বিবরণ দিন (Title is required)'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'খরচের খাত নির্বাচন করুন (Category is required)'],
      trim: true,
      default: 'Others',
    },
    amount: {
      type: Number,
      required: [true, 'টাকার পরিমাণ দিন (Amount is required)'],
      min: [0, 'টাকার পরিমাণ ০ বা তার বেশি হতে হবে'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'family_expenses',
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

const FamilyExpense = mongoose.model('FamilyExpense', familyExpenseSchema);

module.exports = FamilyExpense;

