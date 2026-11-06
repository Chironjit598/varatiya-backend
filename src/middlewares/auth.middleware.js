const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../modules/auth/user.model');
const ApiResponse = require('../utils/apiResponse');

/**
 * Middleware to authenticate requests using Bearer JWT
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error(res, {
        statusCode: 401,
        message: 'Access denied. No Bearer token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return ApiResponse.error(res, {
        statusCode: 401,
        message: 'Invalid authorization format.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return ApiResponse.error(res, {
          statusCode: 401,
          message: 'Access token has expired. Please refresh your token.',
        });
      }
      return ApiResponse.error(res, {
        statusCode: 401,
        message: 'Invalid or malformed access token.',
      });
    }

    const user = await User.findById(decoded.id).select('-password').lean();

    if (!user) {
      return ApiResponse.error(res, {
        statusCode: 401,
        message: 'User belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware for Role-Based Access Control (RBAC)
 * @param  {...string} roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return ApiResponse.error(res, {
        statusCode: 403,
        message: `Forbidden: Access restricted to [${roles.join(', ')}]`,
      });
    }
    next();
  };
};

/**
 * Middleware for optional authentication: sets req.user if valid token provided, but does not block if not
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const token = authHeader.split(' ')[1];
    if (!token) return next();

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password').lean();
      if (user) {
        req.user = user;
      }
    } catch {
      // Ignore token failure in optional auth
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  protect: authenticate,
  optionalAuthenticate,
  authorize,
};
