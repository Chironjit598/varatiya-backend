const ApiResponse = require('../../utils/apiResponse');

// Standard Bangladeshi & international phone number regex helper
const BD_PHONE_REGEX = /^(?:\+?88)?01[3-9]\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Helper to normalize Bangladeshi phone numbers to standard "01XXXXXXXXX" format
 * @param {string} phone
 * @returns {string}
 */
const normalizePhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = String(phone).replace(/\s+/g, '').replace(/-/g, '');
  if (cleaned.startsWith('+8801')) {
    return cleaned.slice(3);
  }
  if (cleaned.startsWith('8801')) {
    return cleaned.slice(2);
  }
  return cleaned;
};

/**
 * Validate Register Payload
 */
const validateRegister = (req, res, next) => {
  const { name, phoneNumber, email, password, role } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('নাম কমপক্ষে ২ অক্ষরের হতে হবে (Name must be at least 2 characters long).');
  }

  if (!phoneNumber) {
    errors.push('মোবাইল নম্বর প্রদান করুন (Phone number is required).');
  } else {
    const normalized = normalizePhoneNumber(phoneNumber);
    if (!BD_PHONE_REGEX.test(normalized)) {
      errors.push('সঠিক বাংলাদেশি মোবাইল নম্বর দিন (e.g. 017XXXXXXXX).');
    } else {
      req.body.phoneNumber = normalized;
    }
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('সঠিক ইমেইল ঠিকানা প্রদান করুন (Valid email address is required).');
  } else {
    req.body.email = email.trim().toLowerCase();
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে (Password must be at least 6 characters long).');
  }

  // Default role to 'Seeker' if not provided
  req.body.role = role && ['Seeker', 'Landlord', 'Both'].includes(role) ? role : 'Seeker';

  if (errors.length > 0) {
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * Validate Verify OTP Payload (Supports both Email and Phone)
 */
const validateVerifyOtp = (req, res, next) => {
  const { email, phoneNumber, otp, purpose } = req.body;
  const errors = [];

  if (!email && !phoneNumber) {
    errors.push('ইমেইল অথবা মোবাইল নম্বর প্রদান করুন (Email or Phone number is required).');
  }

  if (email) {
    req.body.email = String(email).trim().toLowerCase();
  }

  if (phoneNumber) {
    req.body.phoneNumber = normalizePhoneNumber(phoneNumber);
  }

  if (!otp || String(otp).trim().length === 0) {
    errors.push('ওটিপি কোড প্রদান করুন (OTP is required).');
  }

  if (!purpose || !['REGISTRATION', 'FORGOT_PASSWORD'].includes(purpose)) {
    errors.push("Purpose is required and must be 'REGISTRATION' or 'FORGOT_PASSWORD'.");
  }

  if (errors.length > 0) {
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * Validate Resend OTP Payload (Supports both Email and Phone)
 */
const validateResendOtp = (req, res, next) => {
  const { email, phoneNumber, purpose } = req.body;
  const errors = [];

  if (!email && !phoneNumber) {
    errors.push('ইমেইল অথবা মোবাইল নম্বর প্রদান করুন (Email or Phone number is required).');
  }

  if (email) {
    req.body.email = String(email).trim().toLowerCase();
  }

  if (phoneNumber) {
    req.body.phoneNumber = normalizePhoneNumber(phoneNumber);
  }

  if (!purpose || !['REGISTRATION', 'FORGOT_PASSWORD'].includes(purpose)) {
    errors.push("Purpose is required and must be 'REGISTRATION' or 'FORGOT_PASSWORD'.");
  }

  if (errors.length > 0) {
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * Validate Login Payload (Supports Phone Number or Email)
 */
const validateLogin = (req, res, next) => {
  const { phoneNumber, email, identifier, password } = req.body;
  const errors = [];

  const targetIdentifier = identifier || email || phoneNumber;

  if (!targetIdentifier) {
    errors.push('মোবাইল নম্বর অথবা ইমেইল প্রদান করুন (Phone number or Email is required).');
  } else {
    if (String(targetIdentifier).includes('@')) {
      req.body.email = String(targetIdentifier).trim().toLowerCase();
    } else {
      req.body.phoneNumber = normalizePhoneNumber(targetIdentifier);
    }
  }

  if (!password) {
    errors.push('পাসওয়ার্ড প্রদান করুন (Password is required).');
  }

  if (errors.length > 0) {
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * Validate Forgot Password Payload (Supports Email and Phone)
 */
const validateForgotPassword = (req, res, next) => {
  const { email, phoneNumber } = req.body;
  const errors = [];

  if (!email && !phoneNumber) {
    errors.push('ইমেইল অথবা মোবাইল নম্বর প্রদান করুন (Email or Phone number is required).');
  }

  if (email) {
    req.body.email = String(email).trim().toLowerCase();
  }

  if (phoneNumber) {
    req.body.phoneNumber = normalizePhoneNumber(phoneNumber);
  }

  if (errors.length > 0) {
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * Validate Reset Password Payload (Supports Email and Phone)
 */
const validateResetPassword = (req, res, next) => {
  const { email, phoneNumber, otp, newPassword } = req.body;
  const errors = [];

  if (!email && !phoneNumber) {
    errors.push('ইমেইল অথবা মোবাইল নম্বর প্রদান করুন (Email or Phone number is required).');
  }

  if (email) {
    req.body.email = String(email).trim().toLowerCase();
  }

  if (phoneNumber) {
    req.body.phoneNumber = normalizePhoneNumber(phoneNumber);
  }

  if (!otp || String(otp).trim().length === 0) {
    errors.push('ওটিপি কোড প্রদান করুন (OTP is required).');
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    errors.push('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে (New password must be at least 6 characters long).');
  }

  if (errors.length > 0) {
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * Validate Change Password Payload
 */
const validateChangePassword = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const errors = [];

  if (!oldPassword) {
    errors.push('Old password is required.');
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    errors.push('New password is required and must be at least 6 characters long.');
  }

  if (errors.length > 0) {
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * Validate Refresh Token Payload
 */
const validateRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'Refresh token is required in request body.',
    });
  }

  next();
};

module.exports = {
  normalizePhoneNumber,
  validateRegister,
  validateVerifyOtp,
  validateResendOtp,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateRefreshToken,
};
