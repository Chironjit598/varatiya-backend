const userService = require('./user.service');
const ApiResponse = require('../../utils/apiResponse');

class UserController {
  /**
   * GET /api/users/by-phone/:phone
   */
  async getUserByPhone(req, res, next) {
    try {
      const phone = req.params.phone || req.query.phone;
      const user = await userService.findByPhone(phone);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'ব্যবহারকারীর অ্যাকাউন্ট পাওয়া গেছে',
        data: {
          ...user,
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/search?q=<query>
   */
  async searchUsers(req, res, next) {
    try {
      const query = req.query.q || req.query.phone || req.query.search || '';
      const result = await userService.searchUsers(query);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'ব্যবহারকারীর অ্যাকাউন্ট পাওয়া গেছে',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * POST /api/users/mode
   * Set user's active mode ('family' or 'general')
   */
  async setUserMode(req, res, next) {
    try {
      const mode = req.body.mode || 'family';
      const result = await userService.setUserMode(req.user._id, mode);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: mode === 'family' 
          ? 'আপনার অ্যাকাউন্ট সফলভাবে পারিবারিক মোড (Family Mode)-এ পরিবর্তন করা হয়েছে' 
          : 'আপনার অ্যাকাউন্ট সাধারণ মোড (General Mode)-এ ফিরিয়ে আনা হয়েছে',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();

