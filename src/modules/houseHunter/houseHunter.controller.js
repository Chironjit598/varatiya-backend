const houseHunterService = require('./houseHunter.service');
const ApiResponse = require('../../utils/apiResponse');

class HouseHunterController {
  /**
   * User submits a new request
   * POST /api/house-hunter/request
   */
  async submitRequest(req, res, next) {
    try {
      const user = req.user || null;
      const result = await houseHunterService.submitRequest(req.body, user);

      const msg = result.status === 'PAID_ACTIVE'
        ? '১,০০০ টাকা বুকিং ফি পেমেন্ট সম্পন্ন হয়েছে এবং রিকোয়েস্টটি সক্রিয় করা হয়েছে! আমাদের টিম অবিলম্বে বাসা খোঁজার কাজ শুরু করবে।'
        : 'আমরা আপনার রিকোয়েস্টটি গ্রহণ করেছি। আমাদের টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে।';

      return ApiResponse.success(res, {
        statusCode: 201,
        message: msg,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * User submits payment for request
   * POST /api/house-hunter/:id/payment
   */
  async submitPayment(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user || null;
      const result = await houseHunterService.submitPayment(id, req.body, user);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: '১,০০০ টাকা সার্ভিস ফি পেমেন্ট সফল হয়েছে! টিম অবিলম্বে বাসা খোঁজার কাজ শুরু করবে।',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * User checks their own requests
   * GET /api/house-hunter/my-requests
   */
  async getMyRequests(req, res, next) {
    try {
      const phone = req.query.phone || req.user?.phoneNumber || '';
      const userId = req.user?._id || req.user?.id || null;
      const requests = await houseHunterService.getMyRequests(phone, userId);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'অনুরোধ তালিকা সফলভাবে লোড হয়েছে',
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: List all requests
   * GET /admin/api/house-hunter
   */
  async getAdminRequests(req, res, next) {
    try {
      const { page, limit, status, search } = req.query;
      const result = await houseHunterService.getAllRequestsAdmin({ page, limit, status, search });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'অনুরোধ তালিকা লোড হয়েছে',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update request
   * PATCH /admin/api/house-hunter/:id
   */
  async updateAdminRequest(req, res, next) {
    try {
      const { id } = req.params;
      const result = await houseHunterService.updateRequestAdmin(id, req.body);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'অনুরোধ সফলভাবে আপডেট করা হয়েছে',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Delete request
   * DELETE /admin/api/house-hunter/:id
   */
  async deleteAdminRequest(req, res, next) {
    try {
      const { id } = req.params;
      const result = await houseHunterService.deleteRequestAdmin(id);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HouseHunterController();

