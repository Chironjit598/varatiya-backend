const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const env = require('./env');

// Cloudinary is only used if explicitly enabled via ENABLE_CLOUDINARY=true.
// Otherwise, the backend uses its built-in resilient diskStorage and static file serving on /uploads.
const isCloudinaryConfigured = Boolean(
  process.env.ENABLE_CLOUDINARY === 'true' &&
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

const createCloudinaryStorage = (folder = 'basha_lagbe/properties') => {
  if (!isCloudinaryConfigured) return null;

  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1280, crop: 'limit', quality: 'auto' }],
    },
  });
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  createCloudinaryStorage,
};
