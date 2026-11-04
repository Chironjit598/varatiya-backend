const env = require('../config/env');
const ApiResponse = require('../utils/apiResponse');

/**
 * 404 Route Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  return ApiResponse.error(res, {
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Centralized Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map((el) => el.message);
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value entered for ${field}. Please use another value.`;
  }

  // Mongoose invalid ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with id: ${err.value}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  if (env.NODE_ENV === 'development') {
    console.error('[Error Handler]', err);
  }

  return ApiResponse.error(res, {
    statusCode,
    message,
    errors,
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
