const path = require('path');
const adminService = require('./admin.service');
const ApiResponse = require('../../utils/apiResponse');

class AdminController {
  /**
   * Serve HTML Dashboard Page
   * GET /admin or GET /admin/dashboard
   */
  async renderDashboard(req, res) {
    const htmlPath = path.resolve(__dirname, 'dashboard.html');
    return res.sendFile(htmlPath);
  }

  /**
   * API: Get comprehensive admin statistics
   * GET /admin/api/stats
   */
  async getStats(req, res, next) {
    try {
      const stats = await adminService.getDashboardStats();
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Admin stats loaded successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * API: Switch App Mode between Review and Live
   * POST /admin/api/mode?set=live (or set=review)
   */
  async setMode(req, res, next) {
    try {
      const targetMode = req.query.set || req.body?.mode;
      if (!targetMode) {
        return ApiResponse.error(res, {
          statusCode: 400,
          message: 'Target mode is required (?set=live or ?set=review)',
        });
      }

      const updated = await adminService.setAppMode(targetMode);
      return ApiResponse.success(res, {
        statusCode: 200,
        message:
          updated === 'REVIEW'
            ? '✅ Google Review Mode সক্রিয়: পে-ওয়াল বন্ধ (সম্পূর্ণ ফ্রি)'
            : '⚡ Live Production Mode সক্রিয়: ৫০ টাকার পে-ওয়াল চালু',
        data: { mode: updated },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * API: Manually approve / unlock a customer by phone number
   * POST /admin/api/approve-user
   */
  async approveUser(req, res, next) {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return ApiResponse.error(res, {
          statusCode: 400,
          message: 'গ্রাহকের মোবাইল নম্বর প্রদান করুন',
        });
      }

      const result = await adminService.manualApproveUser(phoneNumber);
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

module.exports = new AdminController();
