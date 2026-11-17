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
  } else {
    // Embedded production service account credential fallback for Render deploy
    const defaultB64 = 'ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAidmFyYXRpYS0yY2MxMiIsCiAgInByaXZhdGVfa2V5X2lkIjogImM0MjY1NjEyOGQ5NzE5N2UxM2MzNGZkZjAzMjViMWEwOTcyNmZhYjQiLAogICJwcml2YXRlX2tleSI6ICItLS0tLUJFR0lOIFBSSVZBVEUgS0VZLS0tLS1cbk1JSUV2UUlCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktjd2dnU2pBZ0VBQW9JQkFRREJ6VlhBbkpXd2VOeDJcbi9Bdm1ycFRWRUVGM1hSUUx6UzNqSHJlNkdKVG5jaDdKMDlKN0tqbGJnWGlSOUZTRmZ4WnZBc1RFSmx6Si9maEJcblg0dm9pdC9LL3ZuaWJjbDJmMTlIZ0ZaSU1ydE15c1h2MEZXY3pXTTBCdmxGMEtTSVlMdzVXMnBJMHlLaEc0WWdcbml0b2tZaGhhbXE1ejVCMTY4OHJZeEU1dElQd1BzZmlkdWRZd2xkd2wzZEE4T3ROOTA0RWhjS2JHN29zckpHYkhcbnc4dTgxVkFVWEtsMVJZYTJNRXMra25nVTBnenlLUDJJR3RBY1BXdFVXWVlMNHVYaSs3VzRDd3gzeVpVbjhpZURcbko1dHMydE54aXQ3OGR1ZmpmYnhXdGs2N0R2THl4VkRZb3doWGo3TCthUVA3ZTg0R2t5TkFkbkVqNmNoK2dTWEZcblRhSk5qU25OQWdNQkFBRUNnZ0VBSFRpU0lQQWJLOWdWV2NWb0gvaWJ6VUpkdEpzdXJoYmFQOS8rVU10ckREaXJcblJzQXZBTTRkaHR3UEsyYWRKZUhESnFyU3MwYWJnQU5RbnI3QzBDVzhWNVc1Wkxnc0E3ZHh6TXlmZGRSY1pGaEFcbm53ZVpHUUxvM2N2ZFl2YnlEL1FSL1UzNHlSRTRxL1VEOUwwcTVnaDZacExqRWV0SHZLV3NwS0Y0dDhDYzhOcWZcbmVtT1JOQ3N4Mnk0MkNFR2ZOZGFVT0FTWm00N2MvME9jcE45RkdIQ2RzOGhBekpBb0ZWTHJVSE1iTkdsalhidUFcbm51dkFqSTM2QmVScFBRNXVFUnJ4QjF4QnVYY05MdTlvYnpkTlRYN1FWeHFvTXdtMjNXLzZKWmc5cmtYNjVPak9cblFPanZ3RTFEM0JVaTU1eTJmenpLU3ZPSk9HSXcvRi95RlBTTFBpRW5xd0tCZ1FEL0FYS05PWTlSM0tZa1JnemRcbndUdGNWMUhFbnNJZXJSODVZVjV3RjV5ckxWd0tUaHlzbERkbGl0OFlNb3RjSDdGZmVhU1V4cTFxVHNwcWtJMURcbmZvSGlLMzhnZ3pVaEhSWkJsSUwrMHNiczVySEN2bmlyMzFGYWRmdS8zKzVTcVVMWmI0Z0crVXRibG85dnlPYWNcbk83YUxSZ0FHYTEyK0QrQjE3MExqYjZRLzR3S0JnUURDanNydDFMb3hEWFlUZi9MdWdubzRPdS8yYk5DYm84T09cbnF4Q05ZYU1yaDl3eHdLSS9uR1ZOTU53RXhMMWdYV1dkcUN2ZDAvTDZ5MkwxWEVmVjd2eklZMkxLeWVkblZkdDhcbnJvc0FqbXFrTmFwN21jdjZOV2FYMm14ZEUwYlZxSTZteHFORm9JSy9TS0hRZlZ3OE1nUVRQTlBwS1gycWJwcUNcbldKSTFTSUcrandLQmdRREROVjkwbnNDSkFTa3FFWG5kOUFNMkVCNG5Md1VaS0p3RGQvY3NSZGNIN3dSTFd6cDJcbkhrdzk3azRVSHZVeHc0MHJzbG44RGc5SWx5STY2NGRJU0xxeTRXdEMvMDRYbUVXbVZFTG5RWUZJYnQxYllDWE9cbkpIa0pqOUgxTXo0a2h6QUdkV3VqTXdtdUJoYXRreFIrT3ZQbHIrTnJCcHZQV0NZVEFlS3BhcGhJMHdLQmdGdy9cbm5GUjhRdlF6TDhNN0xaS05aeW4yT0FVZHZ5T3MySEp6QmR3amFWeWdoSFZLb3lPS0lqWWhicEVNUDhiTFFmMG9cbjJmUEtKVEZvOGpqb1VsOUxlNndBQTcyblVnTWJJSURUdWJDLzFpeWFEWVdoZktmY1hoS3VUQ2N0bHE2RHgyK29cblM0NGQ5eUIvYmNvUFJvWjhLSloraHZQTTZucS9DcCszSTB3RVh4QmRBb0dBQ0hUZDhxVDVvUkI0bkNqUkFPenVcbkxHVCtJYlZ2ajRPL3YySWVDaFkyeXNXTTB2K3VNUDFiV2p1VmIraEZvMGhOaWtsN2VwZ3BSSVgrWDRvcUlWMVJcbksvaU93ZXBLdkNadEJKK2J6U2RGTjFSWDZra1lGbkRHMldLbEgzY3djZDR1OFVSNmFuUWptaExuVjBaNGhRMm9cbjZZNFJSeXl0UWxKZjRtRDRXb3YwTFNzPVxuLS0tLS1FTkQgUFJJVkFURSBLRVktLS0tLVxuIiwKICAiY2xpZW50X2VtYWlsIjogImZpcmViYXNlLWFkbWluc2RrLWZic3ZjQHZhcmF0aWEtMmNjMTIuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLAogICJjbGllbnRfaWQiOiAiMTAxNTE3NjA0NTAzNzIzMTY2ODgxIiwKICAiYXV0aF91cmkiOiAiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tL28vb2F1dGgyL2F1dGgiLAogICJ0b2tlbl91cmkiOiAiaHR0cHM6Ly9vYXV0aDIuZ29vZ2xlYXBpcy5jb20vdG9rZW4iLAogICJhdXRoX3Byb3ZpZGVyX3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YxL2NlcnRzIiwKICAiY2xpZW50X3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vcm9ib3QvdjEvbWV0YWRhdGEveDUwOS9maXJlYmFzZS1hZG1pbnNkay1mYnN2YyU0MHZhcmF0aWEtMmNjMTIuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLAogICJ1bml2ZXJzZV9kb21haW4iOiAiZ29vZ2xlYXBpcy5jb20iCn0K';
    try {
      serviceAccount = JSON.parse(Buffer.from(defaultB64, 'base64').toString('utf8'));
    } catch (err) {
      console.error('Failed to parse default firebase service account:', err.message);
    }
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
