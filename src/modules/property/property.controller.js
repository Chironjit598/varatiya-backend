const propertyService = require('./property.service');
const notificationService = require('../notification/notification.service');
const ApiResponse = require('../../utils/apiResponse');

class PropertyController {
  /**
   * Create Property Post (Protected)
   * POST /api/properties
   */
  async createProperty(req, res, next) {
    try {
      const property = await propertyService.createProperty(
        req.user._id,
        req.user,
        req.body
      );

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'বিজ্ঞাপনটি সফলভাবে পোস্ট হয়েছে',
        data: { property },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get All Properties / Home Feed (Public)
   * GET /api/properties
   */
  async getAllProperties(req, res, next) {
    try {
      const result = await propertyService.getAllProperties(req.query);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'বাসার তালিকা সফলভাবে লোড হয়েছে',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Single Property Details (Public)
   * GET /api/properties/:id
   */
  async getPropertyById(req, res, next) {
    try {
      const property = await propertyService.getPropertyById(req.params.id);

      // Async record view tracking to build intelligent user interest profile
      const userId = req.user ? req.user._id : null;
      const deviceId = req.headers['x-device-id'] || req.query.deviceId || null;
      if (userId || deviceId) {
        notificationService
          .recordPropertyView({
            userId,
            deviceId,
            propertyId: req.params.id,
          })
          .catch((err) => console.error('[TrackView Error]:', err.message));
      }

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'বাসার বিস্তারিত পাওয়া গেছে',
        data: { property },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get My Posted Properties (Protected)
   * GET /api/properties/my/posts
   */
  async getMyProperties(req, res, next) {
    try {
      const result = await propertyService.getMyProperties(req.user._id, req.query);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'আপনার পোস্টসমূহ লোড হয়েছে',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle Property Active / Rented Status (Protected)
   * PATCH /api/properties/:id/toggle-status
   */
  async togglePropertyStatus(req, res, next) {
    try {
      const result = await propertyService.togglePropertyStatus(req.params.id, req.user._id);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'বিজ্ঞাপনের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে',
        data: { property: result },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Edit / Update Property Post (Protected)
   * PUT /api/properties/:id
   */
  async updateProperty(req, res, next) {
    try {
      const property = await propertyService.updateProperty(
        req.params.id,
        req.user._id,
        req.body
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'বিজ্ঞাপন সফলভাবে আপডেট করা হয়েছে',
        data: { property },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete Property Post (Protected)
   * DELETE /api/properties/:id
   */
  async deleteProperty(req, res, next) {
    try {
      await propertyService.deleteProperty(req.params.id, req.user._id);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'বিজ্ঞাপনটি সফলভাবে মুছে ফেলা হয়েছে',
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PropertyController();
