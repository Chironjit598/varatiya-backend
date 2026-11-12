const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const env = {
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/basha_lagbe',
  JWT_SECRET:
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV === 'production' ? '' : 'local_dev_only_jwt_access_secret'),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '30d',
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET ||
    (process.env.NODE_ENV === 'production' ? '' : 'local_dev_only_jwt_refresh_secret'),
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  OTP_EXPIRY_MINUTES: Number(process.env.OTP_EXPIRY_MINUTES) || 5,
  DEFAULT_DEV_OTP: process.env.DEFAULT_DEV_OTP || '1234',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  RESEND_FROM: process.env.RESEND_FROM || 'BashaBondhu <otp@varatia.store>',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 465,
  SMTP_USER: process.env.SMTP_USER || process.env.EMAIL_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || process.env.EMAIL_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || '"BashaBondhu" <otp@varatia.store>',
};

module.exports = env;
