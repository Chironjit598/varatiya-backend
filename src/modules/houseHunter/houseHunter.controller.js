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

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'আমরা আপনার রিকোয়েস্টটি গ্রহণ করেছি। আমাদের টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে। ফোনে বিস্তারিত আলোচনার পর ১,০০০ টাকা অগ্রিম বুকিং ফি প্রদান করার পর অর্ডারটি এক্সেপ্ট হবে।',
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

