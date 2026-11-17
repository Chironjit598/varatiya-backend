const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const ApiResponse = require('../../utils/apiResponse');

const requireAdminAuth = (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return ApiResponse.error(res, {
        statusCode: 401,
        message: 'অনুমোদনহীন অ্যাক্সেস। অনুগ্রহ করে প্রথমে এডমিন হিসেবে লগইন করুন।',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch {
      return ApiResponse.error(res, {
        statusCode: 401,
        message: 'এডমিন সেশনের মেয়াদ শেষ হয়েছে বা টোকেন অকার্যকর। পুনরায় লগইন করুন।',
      });
    }

    if (!decoded.isAdmin && decoded.role !== 'bachelor_admin') {
      return ApiResponse.error(res, {
        statusCode: 403,
        message: 'নিষিদ্ধ: এই কাজের জন্য এডমিন পারমিশন প্রয়োজন।',
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireAdminAuth };
