const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../../config/env');
const User = require('../auth/user.model');
const IncomingSms = require('./incomingSms.model');
const PendingVerification = require('./pendingVerification.model');

// 'LIVE' = 50 Tk paywall enabled for users; 'REVIEW' = Google Review Mode (free, zero paywalls)
let currentAppMode = process.env.APP_MODE || (process.env.IS_REVIEW_MODE === 'true' ? 'REVIEW' : 'LIVE');

class PaymentService {
  /**
   * Check if payment / paywall is enabled
   */
  isPaymentEnabled() {
    return currentAppMode === 'LIVE';
  }

  /**
   * Get current operational mode
   */
  getAppMode() {
    return currentAppMode;
  }

  /**
   * Dynamically switch mode between 'LIVE' and 'REVIEW'
   */
  setAppMode(mode) {
    const normalized = String(mode).toUpperCase();
    if (normalized === 'REVIEW') {
      currentAppMode = 'REVIEW';
    } else {
      currentAppMode = 'LIVE';
    }
    return currentAppMode;
  }
  /**
   * Get current Month-Year string, e.g. "2026-11"
   */
  getCurrentMonthYear(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Get Bengali Month Name for a given date
   */
  getBengaliMonthName(date = new Date()) {
    const bengaliMonths = [
      'জানুয়ারি',
      'ফেব্রুয়ারি',
      'মার্চ',
      'এপ্রিল',
      'মে',
      'জুন',
      'জুলাই',
      'আগস্ট',
      'সেপ্টেম্বর',
      'অক্টোবর',
      'নভেম্বর',
      'ডিসেম্বর',
    ];
    return bengaliMonths[date.getMonth()];
  }

  /**
   * Helper to normalize Bangladeshi phone number to 11 digits: 01XXXXXXXXX
   */
  normalizePhoneNumber(phone) {
    if (!phone) return '';
    let cleaned = String(phone).replace(/[^0-9]/g, '');
    if (cleaned.startsWith('880')) {
      cleaned = cleaned.substring(2);
    }
    if (cleaned.length === 10 && cleaned.startsWith('1')) {
      cleaned = '0' + cleaned;
    }
    return cleaned;
  }

  /**
   * Helper to generate JWT tokens matching auth.service
   */
  generateTokens(user) {
    const payload = {
      id: user._id || user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN || '30d',
    });

    const refreshToken = jwt.sign(
      { id: user._id || user.id },
      env.JWT_REFRESH_SECRET,
      {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN || '30d',
      }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Parse incoming bKash or Nagad SMS body
   */
  parseSms(rawSms) {
    if (!rawSms || typeof rawSms !== 'string') return null;

    let text = rawSms.trim();
    let provider = 'UNKNOWN';
    let amount = 0;
    let senderNumber = '';
    let trxId = null;

    // Detect bKash format:
    // e.g. "You have received Tk 50.00 from 01712345678. Ref ... Fee Tk 0.00. Balance Tk ... TrxID 7K3XYZ9"
    // or "Tk 50.00 received from 01712345678"
    if (/bkash/i.test(text) || /received.*from.*TrxID/i.test(text) || /Tk.*from/i.test(text)) {
      provider = 'BKASH';
      const amountMatch = text.match(/(?:Tk|TK|BDT)\s*([0-9]+(?:\.[0-9]+)?)/i);
      if (amountMatch) {
        amount = parseFloat(amountMatch[1]);
      }

      const phoneMatch = text.match(/from\s*(?:\+?88)?(01[3-9][0-9]{8})/i);
      if (phoneMatch) {
        senderNumber = phoneMatch[1];
      }

      const trxMatch = text.match(/TrxID\s*([A-Za-z0-9]+)/i);
      if (trxMatch) {
        trxId = trxMatch[1];
      }
    }

    // Detect Nagad format:
    // e.g. "Customer: 01712345678 ... Amount: Tk 50.00 ... TxnID: 7K3XYZ9"
    if (/nagad/i.test(text) || /Customer:.*Amount:/i.test(text) || /TxnID:/i.test(text)) {
      provider = 'NAGAD';
      const amountMatch = text.match(/Amount:\s*(?:Tk|TK)?\s*([0-9]+(?:\.[0-9]+)?)/i);
      if (amountMatch) {
        amount = parseFloat(amountMatch[1]);
      }

      const phoneMatch = text.match(/(?:Customer|from):\s*(?:\+?88)?(01[3-9][0-9]{8})/i);
      if (phoneMatch) {
        senderNumber = phoneMatch[1];
      }

      const txnMatch = text.match(/(?:TxnID|Txn ID|TrxID):\s*([A-Za-z0-9]+)/i);
      if (txnMatch) {
        trxId = txnMatch[1];
      }
    }

    // Fallback regex if standard format matches any general SMS
    if (!senderNumber) {
      const anyPhone = text.match(/(?:\+?88)?(01[3-9][0-9]{8})/);
      if (anyPhone) senderNumber = anyPhone[1];
    }
    if (!amount) {
      const anyAmount = text.match(/(?:Tk|TK|BDT)\s*([0-9]+(?:\.[0-9]+)?)/i);
      if (anyAmount) amount = parseFloat(anyAmount[1]);
    }

    senderNumber = this.normalizePhoneNumber(senderNumber);

    return {
      provider,
      amount,
      senderNumber,
      trxId,
      rawSms: text,
    };
  }

  /**
   * Process incoming SMS pushed by Android Companion APK
   */
  async processIncomingSms({ rawSms, secretKey, senderPhoneOverride, amountOverride, trxIdOverride }) {
    const configuredSecret = env.SMS_GATEWAY_SECRET || 'bashabondhu_sms_secret_2026';
    if (secretKey !== configuredSecret) {
      const error = new Error('অননুমোদিত গেটওয়ে রিকোয়েস্ট (Unauthorized Gateway)');
      error.statusCode = 401;
      throw error;
    }

    let parsed = this.parseSms(rawSms);
    if (!parsed) {
      const error = new Error('এসএমএস রিড করতে ব্যর্থ হয়েছে');
      error.statusCode = 400;
      throw error;
    }

    // Allow manual/parsed overrides only if it is a valid 11-digit mobile number
    if (senderPhoneOverride) {
      const normalizedOverride = this.normalizePhoneNumber(senderPhoneOverride);
      if (normalizedOverride && normalizedOverride.length === 11 && normalizedOverride.startsWith('01')) {
        parsed.senderNumber = normalizedOverride;
      }
    }
    if (amountOverride && !isNaN(parseFloat(amountOverride))) {
      parsed.amount = parseFloat(amountOverride);
    }
    if (trxIdOverride && String(trxIdOverride).trim()) {
      parsed.trxId = String(trxIdOverride).trim();
    }

    if (!parsed.senderNumber) {
      const error = new Error('এসএমএস থেকে প্রেরকের ফোন নম্বর পাওয়া যায়নি');
      error.statusCode = 422;
      throw error;
    }

    const minThreshold = Number(env.MIN_PAYMENT_THRESHOLD) || 40;
    const monthYear = this.getCurrentMonthYear();

    // Prevent duplicate SMS insertions if trxId already exists
    if (parsed.trxId) {
      const existing = await IncomingSms.findOne({ trxId: parsed.trxId });
      if (existing) {
        return {
          success: true,
          duplicate: true,
          message: 'এই লেনদেনটি ইতোমধ্যে সংরক্ষিত রয়েছে',
          sms: existing,
        };
      }
    }

    const incomingSmsDoc = await IncomingSms.create({
      senderNumber: parsed.senderNumber,
      amount: parsed.amount,
      trxId: parsed.trxId,
      rawSms: parsed.rawSms,
      provider: parsed.provider,
      isClaimed: false,
      monthYear,
      receivedAt: new Date(),
    });

    // Check if amount meets the tolerance threshold (>= 40 Tk)
    if (parsed.amount < minThreshold) {
      return {
        success: true,
        accepted: false,
        belowThreshold: true,
        message: `টাকার পরিমাণ ${minThreshold} টাকার নিচে হওয়ায় স্বয়ংক্রিয় অনুমোদন হবে না`,
        sms: incomingSmsDoc,
      };
    }

    // Check if a customer is currently waiting in PendingVerification queue!
    const pending = await PendingVerification.findOne({
      phoneNumber: parsed.senderNumber,
      monthYear,
      status: 'WAITING',
    }).sort({ createdAt: -1 });

    if (pending) {
      // Instant match!
      const userResult = await this.activateOrRegisterPaidUser(parsed.senderNumber, monthYear);
      incomingSmsDoc.isClaimed = true;
      incomingSmsDoc.claimedByUserId = userResult.user._id;
      incomingSmsDoc.claimedAt = new Date();
      await incomingSmsDoc.save();

      pending.status = 'MATCHED';
      pending.matchedSmsId = incomingSmsDoc._id;
      pending.matchedUserId = userResult.user._id;
      pending.autoPassword = userResult.autoPassword;
      pending.token = userResult.tokens.accessToken;
      await pending.save();

      return {
        success: true,
        matchedImmediately: true,
        user: userResult.user,
        sms: incomingSmsDoc,
      };
    }

    return {
      success: true,
      matchedImmediately: false,
      message: 'এসএমএস সফলভাবে সংরক্ষিত হয়েছে, কাস্টমার রিকোয়েস্টের অপেক্ষা করছে',
      sms: incomingSmsDoc,
    };
  }

  /**
   * Activate or Auto-Register a Paid User for the month
   */
  async activateOrRegisterPaidUser(phoneNumber, monthYear) {
    const cleanPhone = this.normalizePhoneNumber(phoneNumber);
    let user = await User.findOne({ phoneNumber: cleanPhone });
    let autoPassword = null;
    let isNewUser = false;

    if (!user) {
      // Auto-create account: basha + last 3 digits
      const last3 = cleanPhone.slice(-3);
      autoPassword = `basha${last3}`;

      user = await User.create({
        name: 'বাসা বন্ধু গ্রাহক',
        phoneNumber: cleanPhone,
        password: autoPassword, // Pre-save hook hashes with bcrypt
        role: 'Seeker',
        isPhoneVerified: true,
        isEmailVerified: false,
        hasEmailLinked: false,
        authProvider: 'phone_auto',
        isPaid: true,
        paidMonth: monthYear,
        paidUntil: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000), // 32 days
      });
      isNewUser = true;
    } else {
      // Update existing user's paid status for current month
      user.isPaid = true;
      user.paidMonth = monthYear;
      user.paidUntil = new Date(Date.now() + 32 * 24 * 60 * 60 * 1000);
      await user.save();

      // If user was auto-generated originally and hasn't linked email, password was basha + last3
      if (user.authProvider === 'phone_auto' && !user.hasEmailLinked) {
        autoPassword = `basha${cleanPhone.slice(-3)}`;
      }
    }

    const tokens = this.generateTokens(user);

    return {
      user: user.toJSON(),
      tokens,
      autoPassword,
      isNewUser,
    };
  }

  /**
   * Submit connection request by customer entering sender phone number
   */
  async submitConnectionRequest(phoneNumber, deviceId = null) {
    const cleanPhone = this.normalizePhoneNumber(phoneNumber);
    if (!cleanPhone || cleanPhone.length !== 11 || !cleanPhone.startsWith('01')) {
      const error = new Error('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)');
      error.statusCode = 400;
      throw error;
    }

    const monthYear = this.getCurrentMonthYear();
    const minThreshold = Number(env.MIN_PAYMENT_THRESHOLD) || 40;

    // Immediately link this customer phone number to their device tracking record
    if (deviceId) {
      try {
        const GuestDeviceTracking = require('../property/guestDeviceTracking.model');
        await GuestDeviceTracking.updateMany(
          { deviceId },
          { $set: { phoneNumber: cleanPhone } }
        );
      } catch (err) {
        console.error('[Device Tracking Link Error]:', err.message);
      }
    }

    // Check if user already exists and is already paid for current month
    const existingUser = await User.findOne({ phoneNumber: cleanPhone });
    if (existingUser && existingUser.isPaid && existingUser.paidMonth === monthYear) {
      const tokens = this.generateTokens(existingUser);
      return {
        matched: true,
        alreadyActive: true,
        message: 'আপনার চলতি মাসের সংযোগ ইতোমধ্যে সক্রিয় রয়েছে!',
        user: existingUser.toJSON(),
        tokens,
        autoPassword: existingUser.authProvider === 'phone_auto' ? `basha${cleanPhone.slice(-3)}` : null,
      };
    }

    // Check if there is an unclaimed SMS received in the last 24 hours with amount >= minThreshold
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const unclaimedSms = await IncomingSms.findOne({
      senderNumber: cleanPhone,
      monthYear,
      isClaimed: false,
      amount: { $gte: minThreshold },
      receivedAt: { $gte: twentyFourHoursAgo },
    }).sort({ receivedAt: -1 });

    if (unclaimedSms) {
      // Match found right away!
      const userResult = await this.activateOrRegisterPaidUser(cleanPhone, monthYear);

      unclaimedSms.isClaimed = true;
      unclaimedSms.claimedByUserId = userResult.user._id || userResult.user.id;
      unclaimedSms.claimedAt = new Date();
      await unclaimedSms.save();

      return {
        matched: true,
        isNewUser: userResult.isNewUser,
        message: `অভিনন্দন! আপনার ${this.getBengaliMonthName()} মাসের সংযোগ সফলভাবে সক্রিয় হয়েছে।`,
        user: userResult.user,
        tokens: userResult.tokens,
        autoPassword: userResult.autoPassword,
      };
    }

    // No matching SMS yet. Queue into PendingVerification for live matching!
    await PendingVerification.findOneAndUpdate(
      { phoneNumber: cleanPhone, monthYear },
      {
        status: 'WAITING',
        deviceId,
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return {
      matched: false,
      waiting: true,
      phoneNumber: cleanPhone,
      pollIntervalMs: 4000,
      message: 'পেমেন্ট ভেরিফাই করা হচ্ছে... বিকাশ নেটওয়ার্কের কারণে ২০-৬০ সেকেন্ড সময় লাগতে পারে। পেজটিতে অপেক্ষা করুন।',
    };
  }

  /**
   * Poll verification status (called by app every 4-5 seconds while waiting)
   */
  async checkVerificationStatus(phoneNumber) {
    const cleanPhone = this.normalizePhoneNumber(phoneNumber);
    const monthYear = this.getCurrentMonthYear();

    const pending = await PendingVerification.findOne({
      phoneNumber: cleanPhone,
      monthYear,
    }).sort({ updatedAt: -1 });

    if (!pending) {
      return {
        matched: false,
        waiting: false,
        message: 'কোনো পেন্ডিং ভেরিফিকেশন পাওয়া যায়নি।',
      };
    }

    if (pending.status === 'MATCHED') {
      const user = await User.findById(pending.matchedUserId);
      return {
        matched: true,
        waiting: false,
        message: `পেমেন্ট সফলভাবে ভেরিফাইড হয়েছে! পুরো ${this.getBengaliMonthName()} মাস আনলিমিটেড বাসা দেখুন।`,
        user: user ? user.toJSON() : null,
        token: pending.token,
        autoPassword: pending.autoPassword,
      };
    }

    // If still WAITING, check if an SMS just arrived and can be matched right now
    const minThreshold = Number(env.MIN_PAYMENT_THRESHOLD) || 40;
    const unclaimedSms = await IncomingSms.findOne({
      senderNumber: cleanPhone,
      monthYear,
      isClaimed: false,
      amount: { $gte: minThreshold },
    }).sort({ receivedAt: -1 });

    if (unclaimedSms) {
      const userResult = await this.activateOrRegisterPaidUser(cleanPhone, monthYear);

      unclaimedSms.isClaimed = true;
      unclaimedSms.claimedByUserId = userResult.user._id || userResult.user.id;
      unclaimedSms.claimedAt = new Date();
      await unclaimedSms.save();

      pending.status = 'MATCHED';
      pending.matchedSmsId = unclaimedSms._id;
      pending.matchedUserId = userResult.user._id || userResult.user.id;
      pending.autoPassword = userResult.autoPassword;
      pending.token = userResult.tokens.accessToken;
      await pending.save();

      return {
        matched: true,
        waiting: false,
        message: `পেমেন্ট সফলভাবে ভেরিফাইড হয়েছে! পুরো ${this.getBengaliMonthName()} মাস আনলিমিটেড বাসা দেখুন।`,
        user: userResult.user,
        token: userResult.tokens.accessToken,
        autoPassword: userResult.autoPassword,
      };
    }

    return {
      matched: false,
      waiting: true,
      message: 'ভেরিফাই চলছে, অনুগ্রহ করে অপেক্ষা করুন...',
    };
  }

  /**
   * Return dynamic month & pricing configuration for the app
   */
  getPricingConfig() {
    const now = new Date();
    const monthName = this.getBengaliMonthName(now);
    const monthYear = this.getCurrentMonthYear(now);

    return {
      mode: this.getAppMode(),
      isPaymentEnabled: this.isPaymentEnabled(),
      feeAmount: Number(env.CONNECTION_FEE) || 50,
      currency: 'BDT',
      currencySymbol: '৳',
      currentMonthName: monthName,
      currentMonthYear: monthYear,
      bKashNumber: process.env.BKASH_PERSONAL_NUMBER || '01306070598',
      nagadNumber: process.env.NAGAD_PERSONAL_NUMBER || '01306070598',
      whatsAppNumber: process.env.WHATSAPP_SUPPORT_NUMBER || '01726228790',
      paymentType: 'Send Money (পার্সোনাল)',
      title: `পুরো ${monthName} মাস আনলিমিটেড বাড়িওয়ালার ডিরেক্ট নম্বর দেখুন`,
      complianceHeading: 'মাঠপর্যায়ে টু-লেট সংগ্রহ ও বাড়িওয়ালার সাথে সরাসরি কানেকশন সার্ভিস চার্জ',
      emotionalHook:
        'রোদে পুড়ে, জ্যাম ঠেলে বাড়ি বাড়ি ঘুরে বাসা খোঁজার দিন শেষ! মাত্র ৫০ টাকায় পুরো মাস সরাসরি বাড়িওয়ালার সাথে কথা বলুন।',
      freeGuestLimit: Number(env.GUEST_FREE_CONTACT_LIMIT) || 3,
    };
  }
}

module.exports = new PaymentService();

