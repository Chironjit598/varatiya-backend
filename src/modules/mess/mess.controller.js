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
}

module.exports = new MessController();

