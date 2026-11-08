const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../../config/env');
const User = require('./user.model');
const OTP = require('./otp.model');
const { generateOTP, sendSMS } = require('../../utils/smsHelper');
const { sendEmailOtp } = require('../../utils/emailHelper');

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
      email: user.email,
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
   * Create, hash, store, and dispatch an OTP to an email or phone number
   * @param {string|Object} target - Email/phone string or { email, phoneNumber, purpose }
   * @param {'REGISTRATION'|'FORGOT_PASSWORD'} [purposeParam] 
   * @returns {Promise<{email?: string, phoneNumber?: string, otp?: string}>}
   */
  async createAndSendOtp(target, purposeParam) {
    let email = null;
    let phoneNumber = null;
    let purpose = purposeParam || 'REGISTRATION';

    if (typeof target === 'object' && target !== null) {
      email = target.email ? target.email.toLowerCase().trim() : null;
      phoneNumber = target.phoneNumber ? String(target.phoneNumber).trim() : null;
      purpose = target.purpose || purpose;
    } else if (typeof target === 'string') {
      const cleanTarget = target.trim();
      if (cleanTarget.includes('@')) {
        email = cleanTarget.toLowerCase();
      } else {
        phoneNumber = cleanTarget;
      }
    }

    // Invalidate any existing pending OTPs for this target and purpose
    const deleteQuery = { purpose };
    if (email) {
      deleteQuery.email = email;
    } else if (phoneNumber) {
      deleteQuery.phoneNumber = phoneNumber;
    }
    await OTP.deleteMany(deleteQuery);

    const rawOtp = generateOTP(4);
    const hashedOtp = await bcrypt.hash(rawOtp, 10);
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

    await OTP.create({
      ...(email ? { email } : {}),
      ...(phoneNumber ? { phoneNumber } : {}),
      otp: hashedOtp,
      purpose,
      expiresAt,
    });

    // Send OTP via Email first (as requested) or SMS fallback
    if (email) {
      await sendEmailOtp({ email, otp: rawOtp, purpose });
    } else if (phoneNumber) {
      const message = purpose === 'REGISTRATION'
        ? `Your Varatia registration verification code is ${rawOtp}. Valid for ${env.OTP_EXPIRY_MINUTES} minutes.`
        : `Your Varatia password reset verification code is ${rawOtp}. Valid for ${env.OTP_EXPIRY_MINUTES} minutes.`;

      await sendSMS({ phoneNumber, message, otp: rawOtp });
    }

    return {
      ...(email ? { email } : {}),
      ...(phoneNumber ? { phoneNumber } : {}),
      ...(env.NODE_ENV === 'development' ? { devOtp: rawOtp } : {}),
    };
  }

  /**
   * User Registration
   */
  async register({ name, phoneNumber, email, password, role }) {
    const cleanPhone = String(phoneNumber || '').trim();
    const cleanEmail = email ? String(email).toLowerCase().trim() : null;

    // Check if phone already registered
    let existingUser = await User.findOne({ phoneNumber: cleanPhone });
    if (existingUser) {
      const error = new Error('এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট খোলা আছে। অনুগ্রহ করে লগইন করুন। (An account with this phone number already exists)');
      error.statusCode = 400;
      throw error;
    }

    // Check if email already registered
    if (cleanEmail) {
      existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        const error = new Error('এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট খোলা আছে। (An account with this email already exists)');
        error.statusCode = 400;
        throw error;
      }
    }

    const user = await User.create({
      name: name.trim(),
      phoneNumber: cleanPhone,
      email: cleanEmail,
      password,
      role: role || 'Seeker',
      isPhoneVerified: false,
      isEmailVerified: false,
    });

    // Generate & send OTP to user's email (or phone if email not present)
    const otpResult = await this.createAndSendOtp({
      email: cleanEmail,
      phoneNumber: cleanPhone,
      purpose: 'REGISTRATION',
    });
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
  async verifyOtp({ email, phoneNumber, otp, purpose = 'REGISTRATION' }) {
    const cleanEmail = email ? String(email).toLowerCase().trim() : null;
    const cleanPhone = phoneNumber ? String(phoneNumber).trim() : null;

    if (!cleanEmail && !cleanPhone) {
      const error = new Error('Email or phone number is required for OTP verification.');
      error.statusCode = 400;
      throw error;
    }

    const query = {
      purpose,
      expiresAt: { $gt: new Date() },
    };
    if (cleanEmail) {
      query.email = cleanEmail;
    } else {
      query.phoneNumber = cleanPhone;
    }

    // Find latest valid OTP record
    const otpRecord = await OTP.findOne(query).sort({ createdAt: -1 });

    if (!otpRecord) {
      const error = new Error('Invalid or expired OTP. Please request a new one.');
      error.statusCode = 400;
      throw error;
    }

    const isMatch = await otpRecord.compareOTP(otp);
    if (!isMatch) {
      const error = new Error('Incorrect OTP code. Please check and try again.');
      error.statusCode = 400;
      throw error;
    }

    if (purpose === 'REGISTRATION') {
      const userQuery = cleanEmail ? { email: cleanEmail } : { phoneNumber: cleanPhone };
      const user = await User.findOne(userQuery);
      if (!user) {
        const error = new Error('User account not found.');
        error.statusCode = 404;
        throw error;
      }

      user.isEmailVerified = true;
      user.isPhoneVerified = true;
      await user.save();

      // Clear used OTPs
      await OTP.deleteMany(cleanEmail ? { email: cleanEmail, purpose } : { phoneNumber: cleanPhone, purpose });

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
      email: cleanEmail,
      phoneNumber: cleanPhone,
      purpose,
    };
  }

  /**
   * Resend OTP
   */
  async resendOtp({ email, phoneNumber, purpose = 'REGISTRATION' }) {
    const cleanEmail = email ? String(email).toLowerCase().trim() : null;
    const cleanPhone = phoneNumber ? String(phoneNumber).trim() : null;

    if (!cleanEmail && !cleanPhone) {
      const error = new Error('Email or phone number is required to resend OTP.');
      error.statusCode = 400;
      throw error;
    }

    const query = cleanEmail ? { email: cleanEmail } : { phoneNumber: cleanPhone };
    const user = await User.findOne(query).lean();

    if (!user) {
      const error = new Error('No account found with this information.');
      error.statusCode = 404;
      throw error;
    }

    const targetEmail = cleanEmail || user.email;
    const targetPhone = cleanPhone || user.phoneNumber;

    const otpResult = await this.createAndSendOtp({
      email: targetEmail,
      phoneNumber: targetPhone,
      purpose,
    });
    return otpResult;
  }

  /**
   * Standard User Login
   */
  async login({ phoneNumber, email, identifier, password }) {
    const cleanPhone = phoneNumber ? String(phoneNumber).trim() : null;
    const cleanEmail = email ? String(email).toLowerCase().trim() : null;
    const cleanIdentifier = identifier ? String(identifier).trim() : null;
    const cleanPassword = String(password || '').trim();

    let query = {};
    if (cleanPhone) {
      query = { phoneNumber: cleanPhone };
    } else if (cleanEmail) {
      query = { email: cleanEmail };
    } else if (cleanIdentifier) {
      if (cleanIdentifier.includes('@')) {
        query = { email: cleanIdentifier.toLowerCase() };
      } else {
        query = { phoneNumber: cleanIdentifier };
      }
    } else {
      const error = new Error('Phone number or email is required.');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne(query).select('+password');

    if (!user) {
      if (env.NODE_ENV === 'development') {
        console.warn(`[Login Warning] No user found with query:`, query);
      }
      const error = new Error('ভুল মোবাইল নম্বর/ইমেইল অথবা পাসওয়ার্ড। (Invalid phone number/email or password.)');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isPhoneVerified && !user.isEmailVerified) {
      const error = new Error('অ্যাকাউন্ট ভেরিফাই করা হয়নি। দয়া করে ইমেইল ওটিপি ভেরিফিকেশন সম্পন্ন করুন। (Account not verified. Please verify your email OTP before logging in.)');
      error.statusCode = 403;
      error.isVerified = false;
      throw error;
    }

    const isPasswordMatch = await user.comparePassword(cleanPassword);
    if (!isPasswordMatch) {
      if (env.NODE_ENV === 'development') {
        console.warn(`[Login Warning] Password does not match for user:`, query);
      }
      const error = new Error('ভুল মোবাইল নম্বর/ইমেইল অথবা পাসওয়ার্ড। (Invalid phone number/email or password.)');
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
      user.email = email ? String(email).trim().toLowerCase() : null;
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
  async forgotPassword(target) {
    let email = null;
    let phoneNumber = null;

    if (typeof target === 'object' && target !== null) {
      email = target.email ? String(target.email).toLowerCase().trim() : null;
      phoneNumber = target.phoneNumber ? String(target.phoneNumber).trim() : null;
    } else if (typeof target === 'string') {
      const cleanTarget = target.trim();
      if (cleanTarget.includes('@')) {
        email = cleanTarget.toLowerCase();
      } else {
        phoneNumber = cleanTarget;
      }
    }

    if (!email && !phoneNumber) {
      const error = new Error('Email or phone number is required.');
      error.statusCode = 400;
      throw error;
    }

    const query = email ? { email } : { phoneNumber };
    const user = await User.findOne(query).lean();

    if (!user) {
      const error = new Error('No user account found with this email or phone number.');
      error.statusCode = 404;
      throw error;
    }

    const targetEmail = email || user.email;
    const targetPhone = phoneNumber || user.phoneNumber;

    const otpResult = await this.createAndSendOtp({
      email: targetEmail,
      phoneNumber: targetPhone,
      purpose: 'FORGOT_PASSWORD',
    });
    return otpResult;
  }

  /**
   * Reset Password with OTP
   */
  async resetPassword({ email, phoneNumber, otp, newPassword }) {
    const cleanEmail = email ? String(email).toLowerCase().trim() : null;
    const cleanPhone = phoneNumber ? String(phoneNumber).trim() : null;

    if (!cleanEmail && !cleanPhone) {
      const error = new Error('Email or phone number is required to reset password.');
      error.statusCode = 400;
      throw error;
    }

    const query = {
      purpose: 'FORGOT_PASSWORD',
      expiresAt: { $gt: new Date() },
    };
    if (cleanEmail) {
      query.email = cleanEmail;
    } else {
      query.phoneNumber = cleanPhone;
    }

    const otpRecord = await OTP.findOne(query).sort({ createdAt: -1 });

    if (!otpRecord) {
      const error = new Error('Invalid or expired OTP. Please request a new password reset OTP.');
      error.statusCode = 400;
      throw error;
    }

    const isMatch = await otpRecord.compareOTP(otp);
    if (!isMatch) {
      const error = new Error('Incorrect OTP code.');
      error.statusCode = 400;
      throw error;
    }

    const userQuery = cleanEmail ? { email: cleanEmail } : { phoneNumber: cleanPhone };
    const user = await User.findOne(userQuery);
    if (!user) {
      const error = new Error('User account not found.');
      error.statusCode = 404;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      isEmailVerified: true,
      isPhoneVerified: true,
    });

    // Invalidate OTPs
    await OTP.deleteMany(cleanEmail ? { email: cleanEmail, purpose: 'FORGOT_PASSWORD' } : { phoneNumber: cleanPhone, purpose: 'FORGOT_PASSWORD' });

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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

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

  /**
   * Log out authenticated user and unregister their push FCM token
   */
  async logout(userId) {
    if (userId) {
      await User.findByIdAndUpdate(userId, { fcmToken: null });
    }
    return { success: true, message: 'সফলভাবে লগআউট সম্পন্ন হয়েছে' };
  }
}

module.exports = new AuthService();
