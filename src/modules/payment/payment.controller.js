const paymentService = require('./payment.service');
const ApiResponse = require('../../utils/apiResponse');

class PaymentController {
  /**
   * POST /api/payments/sms-webhook
   * Pushed by Android Companion SMS Gateway APK
   */
  async handleSmsWebhook(req, res, next) {
    try {
      const secretKey = req.headers['x-gateway-secret'] || req.body.secretKey;
      const { rawSms, senderPhone, amount, trxId } = req.body;

      const result = await paymentService.processIncomingSms({
        rawSms,
        secretKey,
        senderPhoneOverride: senderPhone,
        amountOverride: amount,
        trxIdOverride: trxId,
      });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: result.message || 'SMS processed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payments/submit-connection
   * Customer enters sender phone number from BasaBondhu app
   */
  async submitConnection(req, res, next) {
    try {
      const { phoneNumber, deviceId } = req.body;
      const resolvedDeviceId = deviceId || req.headers['x-device-id'] || null;

      const result = await paymentService.submitConnectionRequest(phoneNumber, resolvedDeviceId);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payments/poll-status?phoneNumber=017XXXXXXXX
   * Polled by app every 4-5 seconds while waiting for SMS match
   */
  async pollStatus(req, res, next) {
    try {
      const { phoneNumber } = req.query;
      if (!phoneNumber) {
        return ApiResponse.error(res, {
          statusCode: 400,
          message: 'Phone number query parameter is required',
        });
      }

      const result = await paymentService.checkVerificationStatus(phoneNumber);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payments/config
   * Returns monthly pricing, dynamic Bengali month name, and payment instructions
   */
  async getConfig(req, res, next) {
    try {
      const config = paymentService.getPricingConfig();
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Payment configuration fetched successfully',
        data: config,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET/POST /api/payments/mode?set=review (or set=live)
   * Switch between Google Review Mode and Live Production Mode in 1 second
   */
  async getOrSetMode(req, res, next) {
    try {
      const setParam = req.query.set || req.body?.mode;
      if (setParam) {
        const updated = paymentService.setAppMode(setParam);
        return ApiResponse.success(res, {
          statusCode: 200,
          message:
            updated === 'REVIEW'
              ? '✅ Google Review Mode সক্রিয়: সব পে-ওয়াল ও লিমিট বন্ধ (সম্পূর্ণ ফ্রি)'
              : '⚡ Live Production Mode সক্রিয়: ৫০ টাকার পে-ওয়াল ও লিমিট চালু',
          data: {
            mode: updated,
            isPaymentEnabled: paymentService.isPaymentEnabled(),
          },
        });
      }

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Current payment mode fetched',
        data: {
          mode: paymentService.getAppMode(),
          isPaymentEnabled: paymentService.isPaymentEnabled(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();

