const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../../config/env');
const User = require('./user.model');
const OTP = require('./otp.model');
const { generateOTP, sendSMS } = require('../../utils/smsHelper');

class AuthService {
  /**
   * Helper to sign JWT Access and Refresh tokens
   * @param {Object} user 
   * @returns {{accessToken: string, refreshToken: string}}
   */
  generateTokens(user) {
    const payload = {
      id: user._id || user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(
      { id: user._id || user.id },
      env.JWT_REFRESH_SECRET,
      {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN,
      }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Create, hash, store, and dispatch an OTP to a phone number
   * @param {string} phoneNumber 
   * @param {'REGISTRATION'|'FORGOT_PASSWORD'} purpose 
   * @returns {Promise<{phoneNumber: string, otp?: string}>}
   */
  async createAndSendOtp(phoneNumber, purpose) {
    // Invalidate any existing pending OTPs for this phone and purpose
    await OTP.deleteMany({ phoneNumber, purpose });

    const rawOtp = generateOTP(4);
    const hashedOtp = await bcrypt.hash(rawOtp, 10);
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

    await OTP.create({
      phoneNumber,
      otp: hashedOtp,
      purpose,
      expiresAt,
    });

    const message = purpose === 'REGISTRATION'
      ? `Your Basha Lagbe registration verification code is ${rawOtp}. Valid for ${env.OTP_EXPIRY_MINUTES} minutes.`
      : `Your Basha Lagbe password reset verification code is ${rawOtp}. Valid for ${env.OTP_EXPIRY_MINUTES} minutes.`;

    await sendSMS({ phoneNumber, message, otp: rawOtp });

    return {
      phoneNumber,
      ...(env.NODE_ENV === 'development' ? { devOtp: rawOtp } : {}),
    };
  }

  /**
   * User Registration
   */
  async register({ name, phoneNumber, password, role, email }) {
    // Check if user already exists
    let user = await User.findOne({ phoneNumber });

    if (user) {
      const error = new Error('এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট খোলা আছে। অনুগ্রহ করে লগইন করুন। (An account with this phone number already exists)');
      error.statusCode = 400;
      throw error;
    }

    user = await User.create({
      name: name.trim(),
      phoneNumber,
      password,
      email: email || null,
      role: role || 'Seeker',
      isPhoneVerified: true,
    });

    // Generate & send OTP (in case client uses OTP verification step)
    const otpResult = await this.createAndSendOtp(phoneNumber, 'REGISTRATION');
    const tokens = this.generateTokens(user);

    return {
      user: user.toJSON(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      name: user.name,
      ...otpResult,
    };
  }

  /**
   * Verify Registration / General OTP
   */
  async verifyOtp({ phoneNumber, otp, purpose }) {
    // Find latest valid OTP record
    const otpRecord = await OTP.findOne({
      phoneNumber,
      purpose,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    const isDevBypass =
      env.NODE_ENV === 'development' && String(otp).trim() === String(env.DEFAULT_DEV_OTP);

    if (!otpRecord && !isDevBypass) {
      const error = new Error('Invalid or expired OTP. Please request a new one.');
      error.statusCode = 400;
      throw error;
    }

    if (otpRecord) {
      const isMatch = await otpRecord.compareOTP(otp);
      if (!isMatch && !isDevBypass) {
        const error = new Error('Incorrect OTP code. Please check and try again.');
        error.statusCode = 400;
        throw error;
      }
    }

    if (purpose === 'REGISTRATION') {
      const user = await User.findOne({ phoneNumber });
      if (!user) {
        const error = new Error('User account not found.');
        error.statusCode = 404;
        throw error;
      }

      user.isPhoneVerified = true;
      await user.save();

      // Clear used OTPs
      await OTP.deleteMany({ phoneNumber, purpose });

      const tokens = this.generateTokens(user);

      return {
        user: user.toJSON(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    }

    // For other purposes like password reset verification step
    return {
      verified: true,
      phoneNumber,
      purpose,
    };
  }

  /**
   * Resend OTP
   */
  async resendOtp({ phoneNumber, purpose }) {
    const user = await User.findOne({ phoneNumber }).lean();

    if (!user) {
      const error = new Error('No account found with this phone number.');
      error.statusCode = 404;
      throw error;
    }

    const otpResult = await this.createAndSendOtp(phoneNumber, purpose);
    return otpResult;
  }

  /**
   * Standard User Login
   */
  async login({ phoneNumber, password }) {
    const cleanPhone = String(phoneNumber || '').trim();
    const cleanPassword = String(password || '').trim();

    const user = await User.findOne({ phoneNumber: cleanPhone }).select('+password');

    if (!user) {
      if (env.NODE_ENV === 'development') {
        console.warn(`[Login Warning] No user found with phone number: "${cleanPhone}"`);
      }
      const error = new Error('Invalid phone number or password.');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isPhoneVerified) {
      const error = new Error('Phone number is not verified. Please verify your phone number before logging in.');
      error.statusCode = 403;
      error.isPhoneVerified = false;
      throw error;
    }

    const isPasswordMatch = await user.comparePassword(cleanPassword);
    if (!isPasswordMatch) {
      if (env.NODE_ENV === 'development') {
        console.warn(`[Login Warning] Password does not match for phone number: "${cleanPhone}"`);
      }
      const error = new Error('Invalid phone number or password.');
      error.statusCode = 401;
      throw error;
    }

    const tokens = this.generateTokens(user);

    return {
      user: user.toJSON(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Update User Profile (Name, Email, Avatar)
   */
  async updateProfile(userId, { name, email, avatar }) {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    if (name !== undefined && String(name).trim().length >= 2) {
      user.name = String(name).trim();
    }
    if (email !== undefined) {
      user.email = email ? String(email).trim() : null;
    }
    if (avatar !== undefined) {
      user.avatar = avatar ? String(avatar).trim() : null;
    }

    await user.save();
    return this.getProfile(user._id);
  }

  /**
   * Retrieve User Profile (Mongoose .lean() optimization)
   */
  async getProfile(userId) {
    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    user.id = user._id.toString();

    // Dynamically resolve user's current active affiliation across all messes
    const userService = require('../user/user.service');
    user.activeAffiliation = await userService.getUserActiveAffiliation(
      user._id,
      user.phoneNumber
    );

    return user;
  }

  /**
   * Initiate Forgot Password
   */
  async forgotPassword(phoneNumber) {
    const user = await User.findOne({ phoneNumber }).lean();

    if (!user) {
      const error = new Error('No user account found with this phone number.');
      error.statusCode = 404;
      throw error;
    }

    const otpResult = await this.createAndSendOtp(phoneNumber, 'FORGOT_PASSWORD');
    return otpResult;
  }

  /**
   * Reset Password with OTP
   */
  async resetPassword({ phoneNumber, otp, newPassword }) {
    const otpRecord = await OTP.findOne({
      phoneNumber,
      purpose: 'FORGOT_PASSWORD',
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    const isDevBypass =
      env.NODE_ENV === 'development' && String(otp).trim() === String(env.DEFAULT_DEV_OTP);

    if (!otpRecord && !isDevBypass) {
      const error = new Error('Invalid or expired OTP. Please request a new password reset OTP.');
      error.statusCode = 400;
      throw error;
    }

    if (otpRecord) {
      const isMatch = await otpRecord.compareOTP(otp);
      if (!isMatch && !isDevBypass) {
        const error = new Error('Incorrect OTP code.');
        error.statusCode = 400;
        throw error;
      }
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      const error = new Error('User account not found.');
      error.statusCode = 404;
      throw error;
    }

    user.password = newPassword; // Handled by pre-save bcrypt hook
    user.isPhoneVerified = true;
    await user.save();

    // Invalidate OTPs
    await OTP.deleteMany({ phoneNumber, purpose: 'FORGOT_PASSWORD' });

    return true;
  }

  /**
   * Change Password (Authenticated User)
   */
  async changePassword(userId, { oldPassword, newPassword }) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      const error = new Error('Current password does not match.');
      error.statusCode = 400;
      throw error;
    }

    user.password = newPassword; // Handled by pre-save hook
    await user.save();

    return true;
  }

  /**
   * Refresh JWT Access Token
   */
  async refreshToken(refreshToken) {
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch (err) {
      const error = new Error('Invalid or expired refresh token. Please login again.');
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findById(decoded.id).select('-password').lean();
    if (!user) {
      const error = new Error('User no longer exists.');
      error.statusCode = 401;
      throw error;
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
    );

    return { accessToken };
  }
}

module.exports = new AuthService();
