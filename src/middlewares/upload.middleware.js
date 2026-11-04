const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiResponse = require('../utils/apiResponse');

const { createCloudinaryStorage, isCloudinaryConfigured } = require('../config/cloudinary');

// Ensure uploads directory exists for fallback local disk storage
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration (Cloudinary when configured, local disk as fallback)
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `property-${uniqueSuffix}${ext}`);
  },
});

const storage = isCloudinaryConfigured ? createCloudinaryStorage() : diskStorage;

// File type filter - allow only image files (checking both mimetype and file extension)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];
  const ext = path.extname(file.originalname || '').toLowerCase();
  
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/octet-stream' ||
    allowedExtensions.includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(new Error('শুধুমাত্র ছবি (JPEG, JPG, PNG, WEBP) আপলোড করা যাবে'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Max 10MB per image
  },
  fileFilter,
});

const extractFileUrl = (file, req) => {
  // If stored in Cloudinary, multer-storage-cloudinary provides file.path as the full secure URL
  if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    return file.path;
  }
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/uploads/${file.filename}`;
};

/**
 * Middleware for handling Property Post Creation / Update with multipart/form-data images
 * Allows uploading images and form fields simultaneously in a single HTTP request!
 */
const handlePropertyImageUpload = (req, res, next) => {
  const uploadHandler = upload.any();

  uploadHandler(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return ApiResponse.error(res, {
          statusCode: 400,
          message: 'প্রতিটি ছবির সাইজ সর্বোচ্চ ১০ মেগাবাইট (10MB) হতে পারবে',
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return ApiResponse.error(res, {
          statusCode: 400,
          message: 'একবারে সর্বোচ্চ ১০টি ছবি আপলোড করা যাবে',
        });
      }
      return ApiResponse.error(res, {
        statusCode: 400,
        message: `ছবি আপলোড ত্রুটি: ${err.message}`,
      });
    } else if (err) {
      return ApiResponse.error(res, {
        statusCode: 400,
        message: err.message,
      });
    }

    // Process uploaded files if any
    if (req.files && req.files.length > 0) {
      const uploadedUrls = req.files.map((file) => extractFileUrl(file, req));

      // Merge with any existing imageUrls if provided
      if (req.body.imageUrls) {
        let existing = [];
        try {
          existing =
            typeof req.body.imageUrls === 'string'
              ? JSON.parse(req.body.imageUrls)
              : req.body.imageUrls;
          if (!Array.isArray(existing)) existing = [existing];
        } catch {
          existing = [req.body.imageUrls];
        }
        req.body.imageUrls = [...existing, ...uploadedUrls];
      } else {
        req.body.imageUrls = uploadedUrls;
      }
    } else if (typeof req.body.imageUrls === 'string') {
      try {
        req.body.imageUrls = JSON.parse(req.body.imageUrls);
      } catch {
        req.body.imageUrls = [req.body.imageUrls];
      }
    }

    // Normalize types from multipart/form-data text strings
    const numericFields = [
      'bedrooms',
      'bathrooms',
      'balconies',
      'rentPrice',
      'maxOccupants',
      'singleBedRooms',
      'twoBedRooms',
      'threeBedRooms',
      'fourBedRooms',
      'fiveBedRooms',
      'totalSeats',
      'vacantSeats',
    ];
    for (const nf of numericFields) {
      if (req.body[nf] !== undefined && req.body[nf] !== '') {
        req.body[nf] = Number(req.body[nf]);
      }
    }

    const booleanFields = [
      'isNegotiable',
      'isMess',
      'isUtilitySeparate',
      'showUtilityAmountToSeekers',
      'isActive',
    ];
    for (const bf of booleanFields) {
      if (req.body[bf] !== undefined && req.body[bf] !== '') {
        req.body[bf] = req.body[bf] === 'true' || req.body[bf] === true;
      }
    }

    if (req.body.latitude !== undefined && req.body.latitude !== '') {
      req.body.latitude = Number(req.body.latitude);
    }
    if (req.body.longitude !== undefined && req.body.longitude !== '') {
      req.body.longitude = Number(req.body.longitude);
    }

    // Normalize JSON array fields (rooms, utilityBills)
    const jsonArrayFields = ['rooms', 'utilityBills'];
    for (const jf of jsonArrayFields) {
      if (typeof req.body[jf] === 'string') {
        try {
          req.body[jf] = JSON.parse(req.body[jf]);
        } catch {
          req.body[jf] = [];
        }
      }
    }

    // Normalize amenities array
    if (req.body.amenities) {
      if (typeof req.body.amenities === 'string') {
        try {
          req.body.amenities = JSON.parse(req.body.amenities);
        } catch {
          req.body.amenities = req.body.amenities
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
    }

    // Normalize tenantTypes (support array or comma-separated or single string)
    if (req.body.tenantTypes || req.body.tenantType) {
      const raw = req.body.tenantTypes || req.body.tenantType;
      if (typeof raw === 'string') {
        try {
          req.body.tenantTypes = JSON.parse(raw);
        } catch {
          req.body.tenantTypes = raw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        }
      } else if (Array.isArray(raw)) {
        req.body.tenantTypes = raw;
      }
      if (!Array.isArray(req.body.tenantTypes)) {
        req.body.tenantTypes = [req.body.tenantTypes];
      }
    }

    next();
  });
};

/**
 * Middleware handling single image upload
 */
const uploadSingleImage = (req, res, next) => {
  const uploadHandler = upload.single('image');
  uploadHandler(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return ApiResponse.error(res, {
          statusCode: 400,
          message: 'ছবির সাইজ সর্বোচ্চ ১০ মেগাবাইট (10MB) হতে পারবে',
        });
      }
      return ApiResponse.error(res, {
        statusCode: 400,
        message: `ছবি আপলোড ত্রুটি: ${err.message}`,
      });
    } else if (err) {
      return ApiResponse.error(res, {
        statusCode: 400,
        message: err.message,
      });
    }
    next();
  });
};

/**
 * Middleware handling multiple images upload (standalone)
 */
const uploadMultipleImages = (req, res, next) => {
  const uploadHandler = upload.array('images', 10);
  uploadHandler(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return ApiResponse.error(res, {
          statusCode: 400,
          message: 'প্রতিটি ছবির সাইজ সর্বোচ্চ ১০ মেগাবাইট (10MB) হতে পারবে',
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return ApiResponse.error(res, {
          statusCode: 400,
          message: 'একবারে সর্বোচ্চ ১০টি ছবি আপলোড করা যাবে',
        });
      }
      return ApiResponse.error(res, {
        statusCode: 400,
        message: `ছবি আপলোড ত্রুটি: ${err.message}`,
      });
    } else if (err) {
      return ApiResponse.error(res, {
        statusCode: 400,
        message: err.message,
      });
    }
    next();
  });
};

module.exports = {
  handlePropertyImageUpload,
  uploadSingleImage,
  uploadMultipleImages,
  extractFileUrl,
};
