const admin = require('firebase-admin');
const { getMessaging } = require('firebase-admin/messaging');
const path = require('path');
const fs = require('fs');

let isFirebaseInitialized = false;
let messagingService = null;

try {
  let serviceAccount = null;
  const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
      serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8'));
    }
  } else if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = require(serviceAccountPath);
  }

  if (serviceAccount) {
    const app = admin.initializeApp({
      credential: admin.cert(serviceAccount),
    });
    messagingService = getMessaging(app);
    isFirebaseInitialized = true;
    console.log('🔥 [Firebase Admin] Initialized successfully for project:', serviceAccount.project_id);
  } else {
    console.warn('⚠️ [Firebase Admin] Service account key not found at:', serviceAccountPath);
  }
} catch (error) {
  console.error('❌ [Firebase Admin] Initialization failed:', error.message);
}

/**
 * Send real push notification via Firebase Cloud Messaging (FCM)
 */
const sendFcmPushNotification = async ({ token, title, body, data = {} }) => {
  if (!isFirebaseInitialized || !messagingService || !token) {
    return { success: false, reason: 'Firebase not initialized or missing token' };
  }

  // Clean and stringify data fields (FCM only accepts string values in data payload)
  const stringifiedData = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      stringifiedData[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
    }
  }

  const message = {
    token: token.trim(),
    notification: {
      title,
      body,
    },
    data: {
      ...stringifiedData,
      click_action: 'FLUTTER_NOTIFICATION_CLICK',
    },
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        channelId: 'varatia_channel',
        priority: 'high',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
  };

  try {
    const response = await messagingService.send(message);
    console.log(`[FCM PUSH SUCCESS] Delivered to token (${token.slice(0, 10)}...): messageId = ${response}`);
    return { success: true, messageId: response };
  } catch (err) {
    console.error(`[FCM PUSH FAILED] Error sending to token (${token.slice(0, 10)}...):`, err.message);
    const isTokenDead =
      err.code === 'messaging/registration-token-not-registered' ||
      err.code === 'messaging/invalid-registration-token';
    return { success: false, error: err.message, isTokenDead };
  }
};

module.exports = {
  admin,
  messagingService,
  isFirebaseInitialized: () => isFirebaseInitialized,
  sendFcmPushNotification,
};
