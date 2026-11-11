const familyExpenseService = require('./familyExpense.service');
const ApiResponse = require('../../utils/apiResponse');

class FamilyExpenseController {
  /**
   * GET /api/family-expenses
   */
  async getExpenses(req, res, next) {
    try {
      const result = await familyExpenseService.getExpenses(req.user._id);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'পারিবারিক খরচের তালিকা লোড হয়েছে',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/family-expenses
   */
  async createExpense(req, res, next) {
    try {
      const expense = await familyExpenseService.createExpense(req.user._id, req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'নতুন খরচের হিসাব যুক্ত হয়েছে',
        data: {
          expense,
          familyExpense: expense,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/family-expenses/:id/toggle-paid
   */
  async togglePaid(req, res, next) {
    try {
      const expense = await familyExpenseService.togglePaid(req.params.id, req.user._id);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'পরিশোধের স্ট্যাটাস আপডেট করা হয়েছে',
        data: {
          expense,
          familyExpense: expense,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/family-expenses/activate
   * Convert user account into Family Mode
   */
  async activateFamilyMode(req, res, next) {
    try {
      const result = await familyExpenseService.activateFamilyMode(req.user._id);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'আপনার অ্যাকাউন্ট সফলভাবে পারিবারিক মোড (Family Mode)-এ কনভার্ট হয়েছে',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/family-expenses/:id
   */
  async deleteExpense(req, res, next) {
    try {
      await familyExpenseService.deleteExpense(req.params.id, req.user._id);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'খরচের হিসাব মুছে ফেলা হয়েছে',
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FamilyExpenseController();

