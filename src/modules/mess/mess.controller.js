const messService = require('./mess.service');
const ApiResponse = require('../../utils/apiResponse');

class MessController {
  /**
   * GET /api/messes/managed & GET /api/messes
   */
  async getManagedMesses(req, res, next) {
    try {
      const messes = await messService.getManagedMesses(req.user);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'মেসের তালিকা সফলভাবে লোড হয়েছে',
        data: {
          messes,
          managedMesses: messes,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/messes/:messId
   */
  async getMessById(req, res, next) {
    try {
      const mess = await messService.getMessById(req.params.messId);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'মেসের বিস্তারিত তথ্য পাওয়া গেছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/messes
   */
  async createMess(req, res, next) {
    try {
      const mess = await messService.createMess(req.user, req.body);

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'নতুন মেস সফলভাবে তৈরি হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/messes/:messId
   */
  async updateMess(req, res, next) {
    try {
      const mess = await messService.updateMess(
        req.params.messId,
        req.user,
        req.body
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'মেসের তথ্য সফলভাবে আপডেট করা হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/messes/leave
   * User leaves their current mess/room and resets to General Mode
   */
  async leaveMessOrResetMode(req, res, next) {
    try {
      const result = await messService.leaveMessOrResetMode(req.user, req.body);

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
   * POST /api/messes/:messId/assign-border
   */
  async assignBorder(req, res, next) {
    try {
      const result = await messService.assignBorder(
        req.params.messId,
        req.body
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'সিটে বর্ডার সফলভাবে বরাদ্দ করা হয়েছে',
        data: {
          mess: result.mess,
          managedMess: result.mess,
          assignedUser: result.assignedUser,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/messes/:messId/vacate-seat
   */
  async vacateSeat(req, res, next) {
    try {
      const mess = await messService.vacateSeat(req.params.messId, req.body);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'সিটটি সফলভাবে খালি করা হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/messes/:messId/shared-bills
   */
  async addSharedBill(req, res, next) {
    try {
      const result = await messService.addSharedBill(
        req.params.messId,
        req.body
      );

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'যৌথ বিল সফলভাবে যুক্ত করা হয়েছে',
        data: {
          mess: result.mess,
          managedMess: result.mess,
          bill: result.bill,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/messes/:messId/shared-bills/:billId
   */
  async deleteSharedBill(req, res, next) {
    try {
      const mess = await messService.deleteSharedBill(
        req.params.messId,
        req.params.billId
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'যৌথ বিল মুছে ফেলা হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/messes/:messId/notices
   */
  async addNotice(req, res, next) {
    try {
      const result = await messService.addNotice(
        req.params.messId,
        req.user,
        req.body
      );

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'নোটিশ সফলভাবে প্রকাশ করা হয়েছে',
        data: {
          mess: result.mess,
          managedMess: result.mess,
          notice: result.notice,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/messes/:messId/notices/:noticeId
   */
  async deleteNotice(req, res, next) {
    try {
      const mess = await messService.deleteNotice(
        req.params.messId,
        req.user,
        req.params.noticeId
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'নোটিশটি সফলভাবে মুছে ফেলা হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/messes/:messId/meals-per-day
   */
  async updateMealsPerDay(req, res, next) {
    try {
      const mess = await messService.updateMealsPerDay(
        req.params.messId,
        req.body
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'দৈনিক মিলের সংখ্যা আপডেট করা হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/messes/:messId/members/:memberId/toggle-slot
   */
  async toggleMemberSlot(req, res, next) {
    try {
      const mess = await messService.toggleMemberSlot(
        req.params.messId,
        req.params.memberId,
        req.body
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'মিল স্লট আপডেট করা হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/messes/:messId/bazar
   */
  async addBazarEntry(req, res, next) {
    try {
      const result = await messService.addBazarEntry(
        req.params.messId,
        req.user,
        req.body
      );

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'বাজারের হিসাব যুক্ত করা হয়েছে',
        data: {
          mess: result.mess,
          managedMess: result.mess,
          bazarEntry: result.bazarEntry,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/messes/:messId/bazar/:bazarId
   */
  async deleteBazarEntry(req, res, next) {
    try {
      const mess = await messService.deleteBazarEntry(
        req.params.messId,
        req.user,
        req.params.bazarId
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'বাজার এন্ট্রি সফলভাবে মুছে ফেলা হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/messes/:messId/members/:memberId/deposit
   */
  async addMemberDeposit(req, res, next) {
    try {
      const mess = await messService.addMemberDeposit(
        req.params.messId,
        req.params.memberId,
        req.body
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'সদস্যের জমা টাকা যুক্ত করা হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/messes/:messId/members
   */
  async addMember(req, res, next) {
    try {
      const result = await messService.addMember(req.params.messId, req.body);

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'নতুন সদস্য সফলভাবে মেসে যুক্ত করা হয়েছে',
        data: {
          mess: result.mess,
          managedMess: result.mess,
          member: result.member,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/messes/:messId/members/:memberId
   */
  async removeMember(req, res, next) {
    try {
      const mess = await messService.removeMember(
        req.params.messId,
        req.params.memberId
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'সদস্যকে মেস থেকে সরানো হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/messes/:messId/manager
   */
  async setMessManager(req, res, next) {
    try {
      const mess = await messService.setMessManager(
        req.params.messId,
        req.body
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'মেস ম্যানেজার পরিবর্তন করা হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/messes/:messId/meal-requests
   */
  async createMealRequest(req, res, next) {
    try {
      const result = await messService.createMealRequest(
        req.params.messId,
        req.user,
        req.body
      );

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'মিল পরিবর্তনের অনুরোধ পাঠানো হয়েছে',
        data: {
          mess: result.mess,
          managedMess: result.mess,
          mealRequest: result.mealRequest,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/messes/:messId/meal-requests/:requestId/resolve
   */
  async resolveMealRequest(req, res, next) {
    try {
      const result = await messService.resolveMealRequest(
        req.params.messId,
        req.params.requestId,
        req.body
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'মিল অনুরোধ নিষ্পত্তি করা হয়েছে',
        data: {
          mess: result.mess,
          managedMess: result.mess,
          mealRequest: result.mealRequest,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/messes/:messId/settings
   * Update Mess Settings (Operating Mode & Meals per day 2 or 3)
   */
  async updateMessSettings(req, res, next) {
    try {
      const mess = await messService.updateMessSettings(
        req.params.messId,
        req.user,
        req.body
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'মেস সেটিংস সফলভাবে আপডেট করা হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/messes/:messId/bazar-roster
   */
  async getBazarRoster(req, res, next) {
    try {
      const result = await messService.getBazarRoster(req.params.messId, req.user);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'বাজার রোস্টার পাওয়া গেছে',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/messes/:messId/bazar-roster
   */
  async setBazarRoster(req, res, next) {
    try {
      const mess = await messService.setBazarRoster(
        req.params.messId,
        req.user,
        req.body
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'বাজার রোস্টার সফলভাবে সেভ করা হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/messes/:messId/bazar-roster/:entryId
   */
  async updateBazarRosterEntry(req, res, next) {
    try {
      const mess = await messService.updateBazarRosterEntry(
        req.params.messId,
        req.user,
        req.params.entryId,
        req.body
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'বাজার রোস্টার এন্ট্রি আপডেট করা হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/messes/:messId/bazar-roster/:entryId
   */
  async deleteBazarRosterEntry(req, res, next) {
    try {
      const mess = await messService.deleteBazarRosterEntry(
        req.params.messId,
        req.user,
        req.params.entryId
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'বাজার রোস্টার এন্ট্রি মুছে ফেলা হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/messes/:messId/cleaning-roster
   */
  async getCleaningRoster(req, res, next) {
    try {
      const result = await messService.getCleaningRoster(req.params.messId, req.user);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'টয়লেট ও মেস পরিষ্কারের রোস্টার পাওয়া গেছে',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/messes/:messId/cleaning-roster
   */
  async setCleaningRoster(req, res, next) {
    try {
      const mess = await messService.setCleaningRoster(
        req.params.messId,
        req.user,
        req.body
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'পরিষ্কারের তালিকা সফলভাবে সেভ করা হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/messes/:messId/cleaning-roster/:entryId
   */
  async updateCleaningRosterEntry(req, res, next) {
    try {
      const mess = await messService.updateCleaningRosterEntry(
        req.params.messId,
        req.user,
        req.params.entryId,
        req.body
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'পরিষ্কারের শিডিউল আপডেট করা হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/messes/:messId/cleaning-roster/:entryId
   */
  async deleteCleaningRosterEntry(req, res, next) {
    try {
      const mess = await messService.deleteCleaningRosterEntry(
        req.params.messId,
        req.user,
        req.params.entryId
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'পরিষ্কারের শিডিউল মুছে ফেলা হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/messes/:messId/development-fund
   */
  async getDevelopmentFund(req, res, next) {
    try {
      const result = await messService.getDevelopmentFund(req.params.messId, req.user);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'মেস উন্নয়ন ফান্ডের হিসাব পাওয়া গেছে',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/messes/:messId/development-fund/config
   */
  async setDevelopmentFundConfig(req, res, next) {
    try {
      const mess = await messService.setDevelopmentFundConfig(
        req.params.messId,
        req.user,
        req.body
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'মেস উন্নয়ন ফি সফলভাবে নির্ধারণ করা হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/messes/:messId/development-fund/collections
   */
  async recordDevelopmentFeePayment(req, res, next) {
    try {
      const mess = await messService.recordDevelopmentFeePayment(
        req.params.messId,
        req.user,
        req.body
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'মেস উন্নয়ন ফি সফলভাবে জমা নেওয়া হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/messes/:messId/development-fund/expenses
   */
  async recordDevelopmentExpense(req, res, next) {
    try {
      const mess = await messService.recordDevelopmentExpense(
        req.params.messId,
        req.user,
        req.body
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'উন্নয়ন ফান্ড থেকে খরচ সফলভাবে রেকর্ড করা হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/messes/:messId/development-fund/expenses/:expenseId
   */
  async deleteDevelopmentExpense(req, res, next) {
    try {
      const mess = await messService.deleteDevelopmentExpense(
        req.params.messId,
        req.user,
        req.params.expenseId
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'উন্নয়ন ফান্ডের খরচ সফলভাবে মুছে ফেলা হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/messes/:messId/members/:memberId/role
   */
  async setMemberRole(req, res, next) {
    try {
      const mess = await messService.setMemberRole(
        req.params.messId,
        req.user,
        req.params.memberId,
        req.body.role
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'মেম্বারের দায়িত্ব সফলভাবে পরিবর্তন করা হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/messes/:messId/members/:memberId/payments
   */
  async recordMemberPayment(req, res, next) {
    try {
      const mess = await messService.recordMemberPayment(
        req.params.messId,
        req.user,
        req.params.memberId,
        req.body
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'টাকা জমার হিসাব সফলভাবে রেকর্ড করা হয়েছে',
        data: {
          mess,
          managedMess: mess,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/messes/:messId/send-roster-reminders
   */
  async sendRosterReminders(req, res, next) {
    try {
      const result = await messService.sendRosterReminders(
        req.params.messId,
        req.user,
        req.body
      );

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

module.exports = new MessController();

