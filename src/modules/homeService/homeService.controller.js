const homeService = require('./homeService.service');
const ApiResponse = require('../../utils/apiResponse');

class HomeServiceController {
  /**
   * User submits a new booking request
   * POST /api/home-services/booking
   */
  async createBooking(req, res, next) {
    try {
      const user = req.user || null;
      const result = await homeService.createBooking(req.body, user);

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'আপনার সেবা অনুরোধটি সফলভাবে গ্রহণ করা হয়েছে। আমাদের টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে।',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * User checks their bookings
   * GET /api/home-services/my-bookings
   */
  async getMyBookings(req, res, next) {
    try {
      const phone = req.query.phone || req.user?.phoneNumber || '';
      const userId = req.user?._id || req.user?.id || null;
      const bookings = await homeService.getMyBookings(phone, userId);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'বুকিং তালিকা সফলভাবে লোড হয়েছে',
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: View all bookings
   * GET /api/home-services/admin/all
   */
  async getAdminBookings(req, res, next) {
    try {
      const { page, limit, status, search } = req.query;
      const result = await homeService.getAllBookingsAdmin({ page, limit, status, search });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'সকল বুকিং তালিকা লোড হয়েছে',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update booking status or assign provider
   * PATCH /api/home-services/admin/:id/status
   */
  async updateBookingStatus(req, res, next) {
    try {
      const { id } = req.params;
      const result = await homeService.updateBookingStatus(id, req.body);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'বুকিং তথ্য সফলভাবে আপডেট হয়েছে',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HomeServiceController();
