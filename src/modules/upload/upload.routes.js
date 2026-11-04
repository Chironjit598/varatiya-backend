const express = require('express');
const { protect } = require('../../middlewares/auth.middleware');
const {
  uploadSingleImage,
  uploadMultipleImages,
  extractFileUrl,
} = require('../../middlewares/upload.middleware');
const ApiResponse = require('../../utils/apiResponse');

const router = express.Router();

/**
 * @route   POST /api/upload
 * @desc    Upload a single image (e.g. avatar or single photo)
 * @access  Protected
 * Form field name: 'image'
 */
router.post('/', protect, uploadSingleImage, (req, res) => {
  if (!req.file) {
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'কোনো ছবি নির্বাচন করা হয়নি (No image file provided)',
    });
  }

  const fileUrl = extractFileUrl(req.file, req);

  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'ছবি সফলভাবে আপলোড হয়েছে',
    data: {
      filename: req.file.filename || req.file.public_id,
      url: fileUrl,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple images (up to 10 photos)
 * @access  Protected
 * Form field name: 'images'
 */
router.post('/multiple', protect, uploadMultipleImages, (req, res) => {
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
});

module.exports = router;
