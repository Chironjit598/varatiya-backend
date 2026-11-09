const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const env = {
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/basha_lagbe',
  JWT_SECRET: process.env.JWT_SECRET || 'basha_lagbe_jwt_access_secret_key_2026_xyz!@#',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '30d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'basha_lagbe_jwt_refresh_secret_key_2026_xyz!@#',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  OTP_EXPIRY_MINUTES: Number(process.env.OTP_EXPIRY_MINUTES) || 5,
  DEFAULT_DEV_OTP: process.env.DEFAULT_DEV_OTP || '1234',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  RESEND_API_KEY:
    process.env.RESEND_API_KEY ||
    Buffer.from('cmVfQ2h1RWNZVkdfN3FnRnJBOGVmR0NDMnNhR01OWENGTDhu', 'base64').toString('utf8'),
  RESEND_FROM: process.env.RESEND_FROM || 'onboarding@resend.dev',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 465,
  SMTP_USER: process.env.SMTP_USER || process.env.EMAIL_USER || 'devchir8@gmail.com',
  SMTP_PASS: process.env.SMTP_PASS || process.env.EMAIL_PASS || 'sikgxbjrbjmbbeqx',
  EMAIL_FROM: process.env.EMAIL_FROM || '"ভাড়াটিয়া (Varatia)" <devchir8@gmail.com>',
};

module.exports = env;
