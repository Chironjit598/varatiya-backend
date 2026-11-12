const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

if (env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
  });
  console.log('📧 [Email Service] Transporter configured for:', env.SMTP_USER);
} else {
  console.log('📧 [Email Service] No SMTP credentials provided, running in development logging mode.');
}

/**
 * Send an OTP verification email to the user
 * @param {Object} options
 * @param {string} options.email
 * @param {string} options.otp
 * @param {'REGISTRATION'|'FORGOT_PASSWORD'} options.purpose
 */
const sendEmailOtp = async ({ email, otp, purpose = 'REGISTRATION' }) => {
  const isRegistration = purpose === 'REGISTRATION';
  const subject = isRegistration
    ? `বাসাবন্ধু (BashaBondhu) - রেজিস্ট্রেশন ভেরিফিকেশন কোড: ${otp}`
    : `বাসাবন্ধু (BashaBondhu) - পাসওয়ার্ড রিসেট ভেরিফিকেশন কোড: ${otp}`;

  const headingText = isRegistration
    ? 'অ্যাকাউন্ট ভেরিফিকেশন কোড'
    : 'পাসওয়ার্ড রিসেট ভেরিফিকেশন কোড';

  const subText = isRegistration
    ? 'বাসাবন্ধু (BashaBondhu) অ্যাপে অ্যাকাউন্ট খোলার জন্য ধন্যবাদ। আপনার ইমেইল যাচাই করতে নিচের ৪ ডিজিটের ওটিপি কোডটি ব্যবহার করুন:'
    : 'আপনার বাসাবন্ধু (BashaBondhu) অ্যাকাউন্টের পাসওয়ার্ড রিসেট করার জন্য অনুরোধ পাওয়া গেছে। পাসওয়ার্ড পরিবর্তন করতে নিচের ওটিপি কোডটি ব্যবহার করুন:';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .card { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .logo { font-size: 24px; font-weight: 800; color: #0284c7; text-align: center; margin-bottom: 24px; }
        .heading { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; text-align: center; }
        .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; text-align: center; }
        .otp-box { background: #f0f9ff; border: 2px dashed #0284c7; border-radius: 12px; padding: 18px; text-align: center; margin: 0 auto 24px auto; max-width: 240px; }
        .otp-code { font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0284c7; }
        .footer { font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px; }
        .warning { color: #dc2626; font-size: 12px; text-align: center; margin-bottom: 16px; font-weight: 500; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">🏠 বাসাবন্ধু (BashaBondhu)</div>
        <div class="heading">${headingText}</div>
        <div class="text">${subText}</div>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        <div class="warning">⚠️ এই কোডটি ৫ মিনিটের জন্য কার্যকর থাকবে। এটি কারও সাথে শেয়ার করবেন না।</div>
        <div class="footer">
          যদি আপনি এই কোডটির জন্য অনুরোধ না করে থাকেন, তবে অনুগ্রহ করে এই ইমেইলটি উপেক্ষা করুন।<br>
          &copy; ২০২৬ বাসাবন্ধু (BashaBondhu) টিম। সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </body>
    </html>
  `;

  console.log(`\n======================================================`);
  console.log(`📧 [EMAIL OTP DISPATCH] -> To: ${email}`);
  console.log(`🔑 Purpose: ${purpose} | Code: [ ${otp} ] (Valid: ${env.OTP_EXPIRY_MINUTES} mins)`);
  console.log(`======================================================\n`);

  // 1. Prioritize Resend HTTPS API (Runs over Port 443, never blocked by Render cloud firewall)
  if (env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.RESEND_FROM || 'BashaBondhu <otp@varatia.store>',
          to: email,
          subject,
          html,
          text: `${headingText}\n${subText}\n\nআপনার ওটিপি কোড: ${otp}\n(মেয়াদ: ৫ মিনিট)`,
        }),
      });

      const data = await response.json();
      if (response.ok && data.id) {
        console.log(`📧 [Resend Success] MessageId: ${data.id} sent to ${email}`);
        return { success: true, messageId: data.id, provider: 'resend' };
      }
      console.warn(`⚠️ [Resend API Notice]: ${data.message || JSON.stringify(data)}`);
    } catch (resendErr) {
      console.error(`❌ [Resend Error]: ${resendErr.message}`);
    }
  }

  // 2. Fallback to SMTP Transporter
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: email,
        subject,
        html,
        text: `${headingText}\n${subText}\n\nআপনার ওটিপি কোড: ${otp}\n(মেয়াদ: ৫ মিনিট)`,
      });
      console.log(`📧 [Email Sent Success] MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId, provider: 'smtp' };
    } catch (err) {
      console.error(`❌ [Email Send Failure] Error sending email to ${email}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  return { success: true, mode: 'development_console_log' };
};

module.exports = {
  sendEmailOtp,
};

