const express = require('express');
const propertyController = require('./property.controller');
const { protect, optionalAuthenticate } = require('../../middlewares/auth.middleware');
const {
  handlePropertyImageUpload,
  uploadMultipleImages,
  extractFileUrl,
} = require('../../middlewares/upload.middleware');
const ApiResponse = require('../../utils/apiResponse');
const {
  validateObjectId,
  validateCreateProperty,
  validateUpdateProperty,
} = require('./property.validation');

const router = express.Router();

/**
 * @route   POST /api/properties/upload-images
 * @desc    Upload multiple images for a property listing (up to 10 images)
 * @access  Protected
 * Form field name: 'images'
 */
router.post(
  '/upload-images',
  protect,
  uploadMultipleImages,
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return ApiResponse.error(res, {
        statusCode: 400,
        message: 'কোনো ছবি নির্বাচন করা হয়নি (No image files provided)',
      });
    }

    const urls = req.files.map((file) => extractFileUrl(file, req));

    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'ছবিসমূহ সফলভাবে আপলোড হয়েছে',
      data: {
        urls,
        count: req.files.length,
      },
    });
  }
);

/**
 * @route   GET /api/properties/my/posts
 * @desc    Get all properties posted by the current logged-in user
 * @access  Protected
 * (Important: Placed before /:id route)
 */
router.get(
  '/my/posts',
  protect,
  propertyController.getMyProperties
);

/**
 * @route   POST /api/properties
 * @desc    Create a new property listing / to-let ad (Accepts multipart/form-data images directly!)
 * @access  Protected
 */
router.post(
  '/',
  protect,
  handlePropertyImageUpload,
  validateCreateProperty,
  propertyController.createProperty
);

/**
 * @route   GET /api/properties
 * @desc    Get public property feed with filters, search, and pagination
 * @access  Public
 */
router.get(
  '/',
  propertyController.getAllProperties
);

/**
 * @route   GET /api/properties/:id
 * @desc    Get single property details by ID
 * @access  Public
 */
router.get(
  '/:id',
  optionalAuthenticate,
  validateObjectId,
  propertyController.getPropertyById
);

/**
 * @route   PATCH /api/properties/:id/toggle-status
 * @desc    Toggle property active / rented status
 * @access  Protected (Owner only)
 */
router.patch(
  '/:id/toggle-status',
  protect,
  validateObjectId,
  propertyController.togglePropertyStatus
);

/**
 * @route   PUT /api/properties/:id
 * @desc    Edit / update a property listing (Supports updating images via multipart!)
 * @access  Protected (Owner only)
 */
router.put(
  '/:id',
  protect,
  validateObjectId,
  handlePropertyImageUpload,
  validateUpdateProperty,
  propertyController.updateProperty
);

/**
 * @route   DELETE /api/properties/:id
 * @desc    Delete a property post
 * @access  Protected (Owner only)
 */
router.delete(
  '/:id',
  protect,
  validateObjectId,
  propertyController.deleteProperty
);

module.exports = router;
