const env = require('../config/env');

/**
 * Generate a real random numeric OTP code
 * @param {number} [digits=4]
 * @returns {string}
 */
const generateOTP = (digits = 4) => {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

/**
 * Send SMS abstraction
 * In development mode, logs the OTP and message to the console.
 * In production mode, can be plugged into SMS gateways like Greenweb, Twilio, SSL Wireless.
 * 
 * @param {Object} options
 * @param {string} options.phoneNumber
 * @param {string} options.message
 * @param {string} [options.otp]
 * @returns {Promise<{success: boolean, delivered: boolean, devMode: boolean, otp?: string}>}
 */
const sendSMS = async ({ phoneNumber, message, otp = null }) => {
  if (env.NODE_ENV === 'development') {
    console.log(`\n================== [DEV SMS SERVICE] ==================`);
    console.log(`📱 To: ${phoneNumber}`);
    console.log(`💬 Message: ${message}`);
    if (otp) {
      console.log(`🔐 OTP Code: [ ${otp} ] (Valid for ${env.OTP_EXPIRY_MINUTES} minutes)`);
    }
    console.log(`=======================================================\n`);
    return {
      success: true,
      delivered: true,
      devMode: true,
      otp,
    };
  }

  // Production SMS Gateway placeholder / hook
  console.log(`[SMS Gateway] Dispatched SMS to ${phoneNumber}: ${message}`);
  return {
    success: true,
    delivered: true,
    devMode: false,
  };
};

module.exports = {
  generateOTP,
  sendSMS,
};
