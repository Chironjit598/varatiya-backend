const express = require('express');
const authController = require('./auth.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { otpRateLimiter, loginRateLimiter } = require('../../middlewares/rateLimiter');
const {
  validateRegister,
  validateVerifyOtp,
  validateResendOtp,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateRefreshToken,
} = require('./auth.validation');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user & trigger phone verification OTP
 * @access  Public (Rate limited)
 */
router.post(
  '/register',
  otpRateLimiter,
  validateRegister,
  authController.register
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP for registration or password reset
 * @access  Public
 */
router.post(
  '/verify-otp',
  validateVerifyOtp,
  authController.verifyOtp
);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP to user's phone number
 * @access  Public (Rate limited)
 */
router.post(
  '/resend-otp',
  otpRateLimiter,
  validateResendOtp,
  authController.resendOtp
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user with phone number and password
 * @access  Public (Rate limited)
 */
router.post(
  '/login',
  loginRateLimiter,
  validateLogin,
  authController.login
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get currently logged in user profile
 * @access  Private (Bearer JWT)
 */
router.get(
  '/profile',
  authenticate,
  authController.getProfile
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update currently logged in user profile (name, email, avatar)
 * @access  Private (Bearer JWT)
 */
router.put(
  '/profile',
  authenticate,
  authController.updateProfile
);

router.patch(
  '/profile',
  authenticate,
  authController.updateProfile
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset OTP via SMS
 * @access  Public (Rate limited)
 */
router.post(
  '/forgot-password',
  otpRateLimiter,
  validateForgotPassword,
  authController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Verify OTP and reset user password
 * @access  Public
 */
router.post(
  '/reset-password',
  validateResetPassword,
  authController.resetPassword
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Update password for authenticated user
 * @access  Private (Bearer JWT)
 */
router.post(
  '/change-password',
  authenticate,
  validateChangePassword,
  authController.changePassword
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Issue a new JWT access token using a refresh token
 * @access  Public
 */
router.post(
  '/refresh-token',
  validateRefreshToken,
  authController.refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Log out current user & unregister their FCM device token
 * @access  Private (Bearer JWT)
 */
router.post(
  '/logout',
  authenticate,
  authController.logout.bind(authController)
);

module.exports = router;
