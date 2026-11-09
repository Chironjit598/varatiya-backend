const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      index: true,
      trim: true,
      default: null,
    },
    email: {
      type: String,
      index: true,
      trim: true,
      lowercase: true,
      default: null,
    },
    otp: {
      type: String,
      required: [true, 'OTP is required'],
    },
    purpose: {
      type: String,
      enum: {
        values: ['REGISTRATION', 'FORGOT_PASSWORD'],
        message: '{VALUE} is not a valid OTP purpose',
      },
      required: [true, 'Purpose is required'],
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically purge expired OTP records
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance method to verify hashed OTP
otpSchema.methods.compareOTP = async function (candidateOtp) {
  if (!candidateOtp) return false;
  return bcrypt.compare(String(candidateOtp).trim(), this.otp);
};

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
