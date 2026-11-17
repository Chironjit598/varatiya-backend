const path = require('path');
const adminService = require('./admin.service');
const propertyService = require('../property/property.service');
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
   * API: Admin Login
   * POST /admin/api/login
   */
  async login(req, res, next) {
    try {
      const { phoneNumber, password, passkey } = req.body;
      const result = await adminService.adminLogin({ phoneNumber, password, passkey });
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'এডমিন লগইন সফল হয়েছে',
        data: result,
      });
    } catch (error) {
      return ApiResponse.error(res, {
        statusCode: 401,
        message: error.message || 'এডমিন লগইন ব্যর্থ হয়েছে',
      });
    }
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
   * API: User Management - List & Search
   * GET /admin/api/users
   */
  async getUsers(req, res, next) {
    try {
      const { search, filter, page, limit } = req.query;
      const result = await adminService.getAllUsers({ search, filter, page, limit });
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Users loaded successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * API: User Management - Get properties viewed by a user
   * GET /admin/api/users/:id/viewed-properties
   */
  async getUserViewedProperties(req, res, next) {
    try {
      const { id } = req.params;
      const result = await adminService.getUserViewedProperties(id);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'User viewed properties loaded',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * API: User Management - Toggle Paid Status
   * POST /admin/api/users/:id/toggle-paid
   */
  async toggleUserPaid(req, res, next) {
    try {
      const { id } = req.params;
      const result = await adminService.toggleUserPaid(id);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * API: User Management - Reset Password
   * POST /admin/api/users/:id/reset-password
   */
  async resetUserPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      const result = await adminService.resetUserPassword(id, newPassword || '123456');
      return ApiResponse.success(res, {
        statusCode: 200,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * API: User Management - Delete User
   * DELETE /admin/api/users/:id
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await adminService.deleteUser(id);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * API: Property Management - List & Search
   * GET /admin/api/properties
   */
  async getProperties(req, res, next) {
    try {
      const { search, filter, page, limit } = req.query;
      const result = await adminService.getAllProperties({ search, filter, page, limit });
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Properties loaded successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * API: Property Management - Toggle Active / Hide
   * POST /admin/api/properties/:id/toggle-active
   */
  async togglePropertyActive(req, res, next) {
    try {
      const { id } = req.params;
      const result = await adminService.togglePropertyActive(id);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * API: Property Management - Delete Property
   * DELETE /admin/api/properties/:id
   */
  async deleteProperty(req, res, next) {
    try {
      const { id } = req.params;
      const result = await adminService.deleteProperty(id);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * API: Reports Management - Get Reports
   * GET /admin/api/reports
   */
  async getReports(req, res, next) {
    try {
      const reports = await adminService.getReports();
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Reports loaded successfully',
        data: reports,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * API: Reports Management - Resolve Report
   * POST /admin/api/reports/:id/resolve
   */
  async resolveReport(req, res, next) {
    try {
      const { id } = req.params;
      const { action } = req.body;
      const result = await adminService.resolveReport(id, action);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * API: App Configuration - Get
   * GET /admin/api/config
   */
  async getConfig(req, res, next) {
    try {
      const config = await adminService.getAppConfig();
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Config loaded',
        data: config,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * API: App Configuration - Update
   * POST /admin/api/config
   */
  async updateConfig(req, res, next) {
    try {
      const result = await adminService.updateAppConfig(req.body);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: result.message,
        data: result.config,
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

  /**
   * API: Save or Update CRM Lead details (notes, priority, follow-up, customLimit)
   * POST /admin/api/crm/lead
   */
  async saveCrmLead(req, res, next) {
    try {
      const result = await adminService.saveCrmLead(req.body);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: result.message,
        data: result.lead,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * API: Set or increase custom free view limit for user/device
   * POST /admin/api/users/:id/set-limit
   */
  async setUserLimit(req, res, next) {
    try {
      const { id } = req.params;
      const { limit } = req.body;
      const result = await adminService.setUserCustomLimit(id, limit);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * API: Get CRM leads list
   * GET /admin/api/crm/leads
   */
  async getCrmLeads(req, res, next) {
    try {
      const { filter, page, limit } = req.query;
      const result = await adminService.getCrmLeads({ filter, page, limit });
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'CRM leads loaded',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * API: Get audience token count for push notification filter
   * GET /admin/api/notifications/audience-count
   */
  async getAudienceCount(req, res, next) {
    try {
      const { audience, phone } = req.query;
      const result = await adminService.getAudienceCount(audience, phone);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Audience count calculated',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * API: Send Broadcast Push Notification
   * POST /admin/api/notifications/send-push
   */
  async sendPushNotification(req, res, next) {
    try {
      const { title, body, targetAudience, specificPhone } = req.body;
      const adminName = req.adminUser?.name || 'Admin';
      const result = await adminService.sendBroadcastPushNotification({
        title,
        body,
        targetAudience,
        specificPhone,
        adminName,
      });
      return ApiResponse.success(res, {
        statusCode: 200,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * API: Get Push Notification History Logs
   * GET /admin/api/notifications/push-logs
   */
  async getPushLogs(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await adminService.getPushLogs({ page, limit });
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Push logs loaded',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * API: Create a new property from admin panel
   * POST /admin/api/properties
   */
  async createProperty(req, res, next) {
    try {
      const adminUserId = req.admin.id;
      const adminUser = {
        _id: req.admin.id,
        name: req.admin.phoneNumber === '01306070598' ? 'Chironjit Chandra Roy (Admin)' : 'Minhas (Manager)',
        phoneNumber: req.admin.phoneNumber,
        role: req.admin.role,
      };
      const result = await propertyService.createProperty(adminUserId, adminUser, req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: `বিজ্ঞাপন সফলভাবে তৈরি হয়েছে! কোড: #${result.propertyCode}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * API: Get comprehensive Bangladesh / Dhaka locations
   * GET /admin/api/locations
   */
  async getLocations(req, res, next) {
    try {
      const locations = require('../../config/bangladeshLocations.json');
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Locations loaded',
        data: locations,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
