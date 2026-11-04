const authService = require('./auth.service');
const ApiResponse = require('../../utils/apiResponse');

class AuthController {
  /**
   * Handle user registration
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { name, phoneNumber, password, role } = req.body;
      const result = await authService.register({ name, phoneNumber, password, role });

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'OTP sent to phone number',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle OTP verification (for Registration & others)
   * POST /api/auth/verify-otp
   */
  async verifyOtp(req, res, next) {
    try {
      const { phoneNumber, otp, purpose } = req.body;
      const result = await authService.verifyOtp({ phoneNumber, otp, purpose });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Account verified successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Resending OTP
   * POST /api/auth/resend-otp
   */
  async resendOtp(req, res, next) {
    try {
      const { phoneNumber, purpose } = req.body;
      const result = await authService.resendOtp({ phoneNumber, purpose });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'OTP resent successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle User Login
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { phoneNumber, password } = req.body;
      const result = await authService.login({ phoneNumber, password });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Current User Profile
   * GET /api/auth/profile
   */
  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user._id);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'User profile retrieved successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Update User Profile
   * PUT /api/auth/profile or PATCH /api/auth/profile
   */
  async updateProfile(req, res, next) {
    try {
      const user = await authService.updateProfile(req.user._id, req.body);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Request for Password Reset OTP
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const { phoneNumber } = req.body;
      const result = await authService.forgotPassword(phoneNumber);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Password reset OTP sent to your phone',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Reset Password
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { phoneNumber, otp, newPassword } = req.body;
      await authService.resetPassword({ phoneNumber, otp, newPassword });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Password has been reset successfully. Please login.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Change Password for logged in user
   * POST /api/auth/change-password
   */
  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      await authService.changePassword(req.user._id, { oldPassword, newPassword });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Password updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Refresh Token
   * POST /api/auth/refresh-token
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
