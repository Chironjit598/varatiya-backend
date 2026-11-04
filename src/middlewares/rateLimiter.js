const rateLimit = require('express-rate-limit');
const ApiResponse = require('../utils/apiResponse');

/**
 * OTP Request Rate Limiter (Max 5 OTP requests per minute per IP)
 */
const otpRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.error(res, {
      statusCode: 429,
      message: 'Too many OTP requests. Please wait a minute before requesting another OTP.',
    });
  },
});

/**
 * Login Rate Limiter
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.error(res, {
      statusCode: 429,
      message: 'Too many login attempts. Please try again after 15 minutes.',
    });
  },
});

/**
 * General API Rate Limiter
 */
const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.error(res, {
      statusCode: 429,
      message: 'Too many requests from this IP. Please try again later.',
    });
  },
});

module.exports = {
  otpRateLimiter,
  loginRateLimiter,
  generalRateLimiter,
};
