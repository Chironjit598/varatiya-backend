const ApiResponse = require('../../utils/apiResponse');

// Standard Bangladeshi & international phone number regex helper
const BD_PHONE_REGEX = /^(?:\+?88)?01[3-9]\d{8}$/;

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
  const { name, phoneNumber, password, role } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters long.');
  }

  if (!phoneNumber) {
    errors.push('Phone number is required.');
  } else {
    const normalized = normalizePhoneNumber(phoneNumber);
    if (!BD_PHONE_REGEX.test(normalized)) {
      errors.push('Please provide a valid Bangladeshi phone number (e.g. 017XXXXXXXX).');
    } else {
      req.body.phoneNumber = normalized;
    }
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters long.');
  }

  if (role && !['Seeker', 'Landlord', 'Both'].includes(role)) {
    errors.push('Role must be one of: Seeker, Landlord, Both.');
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
 * Validate Verify OTP Payload
 */
const validateVerifyOtp = (req, res, next) => {
  const { phoneNumber, otp, purpose } = req.body;
  const errors = [];

  if (!phoneNumber) {
    errors.push('Phone number is required.');
  } else {
    req.body.phoneNumber = normalizePhoneNumber(phoneNumber);
  }

  if (!otp || String(otp).trim().length === 0) {
    errors.push('OTP is required.');
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
 * Validate Resend OTP Payload
 */
const validateResendOtp = (req, res, next) => {
  const { phoneNumber, purpose } = req.body;
  const errors = [];

  if (!phoneNumber) {
    errors.push('Phone number is required.');
  } else {
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
 * Validate Login Payload
 */
const validateLogin = (req, res, next) => {
  const { phoneNumber, password } = req.body;
  const errors = [];

  if (!phoneNumber) {
    errors.push('Phone number is required.');
  } else {
    req.body.phoneNumber = normalizePhoneNumber(phoneNumber);
  }

  if (!password) {
    errors.push('Password is required.');
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
 * Validate Forgot Password Payload
 */
const validateForgotPassword = (req, res, next) => {
  const { phoneNumber } = req.body;
  const errors = [];

  if (!phoneNumber) {
    errors.push('Phone number is required.');
  } else {
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
 * Validate Reset Password Payload
 */
const validateResetPassword = (req, res, next) => {
  const { phoneNumber, otp, newPassword } = req.body;
  const errors = [];

  if (!phoneNumber) {
    errors.push('Phone number is required.');
  } else {
    req.body.phoneNumber = normalizePhoneNumber(phoneNumber);
  }

  if (!otp) {
    errors.push('OTP is required.');
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
