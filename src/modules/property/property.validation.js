const mongoose = require('mongoose');
const ApiResponse = require('../../utils/apiResponse');

const DEFAULT_PROPERTY_IMAGE =
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80';

/**
 * Validate MongoDB ObjectId parameter
 */
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'অবৈধ বিজ্ঞাপন আইডি (Invalid Property ID)',
    });
  }
  next();
};

/**
 * Validate Create Property Payload
 * Supports:
 * 1. Entire Flat (isMess: false, rentType: 'entire_house')
 * 2. Single Room / Sublet (isMess: false, rentType: 'single_room')
 * 3. Mess Seat Post (isMess: true)
 */
const validateCreateProperty = (req, res, next) => {
  const isMess = req.body.isMess === true || req.body.isMess === 'true';
  req.body.isMess = isMess;

  const {
    title,
    area,
    subArea,
    rentPrice,
    availableMonth,
    latitude,
    longitude,
  } = req.body;

  const errors = [];

  if (isMess) {
    const s1 = Math.max(0, Number(req.body.singleBedRooms) || 0);
    const s2 = Math.max(0, Number(req.body.twoBedRooms) || 0);
    const s3 = Math.max(0, Number(req.body.threeBedRooms) || 0);
    const s4 = Math.max(0, Number(req.body.fourBedRooms) || 0);
    const s5 = Math.max(0, Number(req.body.fiveBedRooms) || 0);
    const totalRoomsCount =
      s1 +
      s2 +
      s3 +
      s4 +
      s5 ||
      (Array.isArray(req.body.rooms) ? req.body.rooms.length : 1);

    if (req.body.bedrooms === undefined || req.body.bedrooms === null || isNaN(Number(req.body.bedrooms))) {
      req.body.bedrooms = Math.max(1, totalRoomsCount);
    }
    if (req.body.bathrooms === undefined || req.body.bathrooms === null || isNaN(Number(req.body.bathrooms))) {
      req.body.bathrooms = 0;
    }
    if (req.body.balconies === undefined || req.body.balconies === null || isNaN(Number(req.body.balconies))) {
      req.body.balconies = 0;
    }
  } else {
    if (req.body.bedrooms === undefined || req.body.bedrooms === null || Number(req.body.bedrooms) < 1) {
      if (req.body.rentType === 'single_room') {
        req.body.bedrooms = 1;
      } else {
        errors.push('বেডরুম সংখ্যা কমপক্ষে ১ হতে হবে');
      }
    }

    if (req.body.bathrooms === undefined || req.body.bathrooms === null || Number(req.body.bathrooms) < 1) {
      if (req.body.rentType === 'single_room') {
        req.body.bathrooms = 1;
      } else {
        errors.push('বাথরুম সংখ্যা কমপক্ষে ১ হতে হবে');
      }
    }

    if (req.body.balconies !== undefined && req.body.balconies !== null && Number(req.body.balconies) < 0) {
      errors.push('বারান্দার সংখ্যা ০ বা তার বেশি হতে হবে');
    }
  }

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    if (isMess) {
      req.body.title = `${req.body.buildingName || 'মেস'} - সিট ভাড়া (${req.body.subArea || req.body.area || 'ঢাকা'})`;
    } else {
      req.body.title = `${req.body.bedrooms || 2} BHK Flat for Rent in ${req.body.subArea || req.body.area || 'Dhaka'}`;
    }
  } else if (title.trim().length > 160) {
    errors.push('শিরোনাম সর্বোচ্চ ১৬০ অক্ষরের হতে পারে');
  }

  if (!area || typeof area !== 'string' || area.trim().length === 0) {
    errors.push('এলাকা নির্বাচন করুন (Area is required)');
  }

  if (!subArea || typeof subArea !== 'string' || subArea.trim().length === 0) {
    if (area && typeof area === 'string' && area.trim().length > 0) {
      req.body.subArea = area.trim();
    } else {
      errors.push('সাব-এলাকা দিন (Sub-area is required)');
    }
  }

  if (
    !req.body.detailedAddress ||
    typeof req.body.detailedAddress !== 'string' ||
    req.body.detailedAddress.trim().length === 0
  ) {
    req.body.detailedAddress = req.body.subArea || req.body.area || 'Address not specified';
  }

  if (
    rentPrice === undefined ||
    rentPrice === null ||
    isNaN(Number(rentPrice)) ||
    Number(rentPrice) < 100
  ) {
    errors.push('ভাড়ার পরিমাণ সঠিক হতে হবে');
  }

  // Normalize tenantType & tenantTypes
  if (
    req.body.tenantTypes &&
    Array.isArray(req.body.tenantTypes) &&
    req.body.tenantTypes.length > 0
  ) {
    if (!req.body.tenantType) {
      req.body.tenantType = req.body.tenantTypes.join(', ');
    }
  } else if (req.body.tenantType && typeof req.body.tenantType === 'string') {
    req.body.tenantTypes = req.body.tenantType
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  } else {
    req.body.tenantType = isMess ? 'Bachelor (Male)' : 'Any';
    req.body.tenantTypes = [req.body.tenantType];
  }

  if (!availableMonth || typeof availableMonth !== 'string' || availableMonth.trim().length === 0) {
    req.body.availableMonth = 'চলতি মাস থেকে';
  }

  if (!req.body.imageUrls || !Array.isArray(req.body.imageUrls) || req.body.imageUrls.length === 0) {
    req.body.imageUrls = [DEFAULT_PROPERTY_IMAGE];
  }

  if (
    latitude !== undefined &&
    latitude !== '' &&
    (isNaN(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90)
  ) {
    errors.push('অবৈধ অক্ষাংশ (Invalid Latitude)');
  }

  if (
    longitude !== undefined &&
    longitude !== '' &&
    (isNaN(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180)
  ) {
    errors.push('অবৈধ দ্রাঘিমাংশ (Invalid Longitude)');
  }

  if (errors.length > 0) {
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'তথ্য যাচাইকরণে সমস্যা পাওয়া গেছে (Validation Failed)',
      errors,
    });
  }

  next();
};

/**
 * Validate Update Property Payload
 */
const validateUpdateProperty = (req, res, next) => {
  const {
    title,
    rentPrice,
    latitude,
    longitude,
  } = req.body;

  const errors = [];

  if (
    title !== undefined &&
    (typeof title !== 'string' || title.trim().length === 0 || title.trim().length > 160)
  ) {
    errors.push('শিরোনাম সর্বোচ্চ ১৬০ অক্ষরের হতে পারে');
  }

  if (rentPrice !== undefined && (isNaN(Number(rentPrice)) || Number(rentPrice) < 100)) {
    errors.push('ভাড়ার পরিমাণ সঠিক হতে হবে');
  }

  if (
    req.body.tenantTypes &&
    Array.isArray(req.body.tenantTypes) &&
    req.body.tenantTypes.length > 0 &&
    !req.body.tenantType
  ) {
    req.body.tenantType = req.body.tenantTypes.join(', ');
  } else if (req.body.tenantType && !req.body.tenantTypes) {
    req.body.tenantTypes = String(req.body.tenantType)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (
    latitude !== undefined &&
    latitude !== '' &&
    (isNaN(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90)
  ) {
    errors.push('অবৈধ অক্ষাংশ (Invalid Latitude)');
  }

  if (
    longitude !== undefined &&
    longitude !== '' &&
    (isNaN(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180)
  ) {
    errors.push('অবৈধ দ্রাঘিমাংশ (Invalid Longitude)');
  }

  if (errors.length > 0) {
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'তথ্য যাচাইকরণে সমস্যা পাওয়া গেছে (Validation Failed)',
      errors,
    });
  }

  next();
};

module.exports = {
  validateObjectId,
  validateCreateProperty,
  validateUpdateProperty,
};
