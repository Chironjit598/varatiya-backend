const express = require('express');
const paymentController = require('./payment.controller');

const router = express.Router();

/**
 * @route   POST /api/payments/sms-webhook
 * @desc    Receive SMS pushed by Android SMS Gateway Companion APK
 * @access  Protected by X-Gateway-Secret
 */
router.post('/sms-webhook', paymentController.handleSmsWebhook.bind(paymentController));

/**
 * @route   POST /api/payments/submit-connection
 * @desc    Customer submits their sender phone number to claim connection
 * @access  Public
 */
router.post('/submit-connection', paymentController.submitConnection.bind(paymentController));

/**
 * @route   GET /api/payments/poll-status
 * @desc    Poll verification status while waiting for SMS
 * @access  Public
 */
router.get('/poll-status', paymentController.pollStatus.bind(paymentController));

/**
 * @route   GET /api/payments/config
 * @desc    Get pricing, dynamic month name, and payment instructions
 * @access  Public
 */
router.get('/config', paymentController.getConfig.bind(paymentController));

/**
 * @route   GET/POST /api/payments/mode
 * @desc    Toggle between Google Review Mode (free, zero paywalls) and Live Mode
 * @access  Public
 */
router.get('/mode', paymentController.getOrSetMode.bind(paymentController));
router.post('/mode', paymentController.getOrSetMode.bind(paymentController));

module.exports = router;

