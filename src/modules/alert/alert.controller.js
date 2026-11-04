const alertService = require('./alert.service');
const ApiResponse = require('../../utils/apiResponse');

class AlertController {
  /**
   * GET /api/alerts
   */
  async getAlerts(req, res, next) {
    try {
      const alerts = await alertService.getAlerts(req.user._id);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'অ্যালার্ট তালিকা সফলভাবে লোড হয়েছে',
        data: { alerts },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/alerts
   */
  async createAlert(req, res, next) {
    try {
      const alert = await alertService.createAlert(req.user._id, req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'নতুন রেন্টাল অ্যালার্ট সফলভাবে তৈরি হয়েছে',
        data: { alert },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/alerts/:id/toggle
   */
  async toggleAlert(req, res, next) {
    try {
      const alert = await alertService.toggleAlert(req.params.id, req.user._id);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'অ্যালার্টের স্ট্যাটাস পরিবর্তিত হয়েছে',
        data: { alert },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/alerts/:id
   */
  async deleteAlert(req, res, next) {
    try {
      await alertService.deleteAlert(req.params.id, req.user._id);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'অ্যালার্ট সফলভাবে মুছে ফেলা হয়েছে',
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AlertController();

