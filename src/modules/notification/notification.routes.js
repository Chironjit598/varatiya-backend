const express = require('express');
const notificationController = require('./notification.controller');
const { authenticate, optionalAuthenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();

// GET all notifications (Protected)
router.get('/', authenticate, notificationController.getNotifications.bind(notificationController));

// GET my current interest profile (Protected)
router.get('/my-interest', authenticate, notificationController.getMyInterest.bind(notificationController));

// PATCH mark all as read (Protected)
router.patch('/read-all', authenticate, notificationController.markAllAsRead.bind(notificationController));

// PATCH mark single notification as read (Protected)
router.patch('/:id/read', authenticate, notificationController.markAsRead.bind(notificationController));

// POST reactivate property directly from notification (Protected)
router.post('/:id/reactivate', authenticate, notificationController.reactivateFromNotification.bind(notificationController));

// POST register/update FCM device token (Optional authenticate)
router.post('/fcm-token', optionalAuthenticate, notificationController.saveFcmToken.bind(notificationController));

// POST track user view event (Optional authenticate)
router.post('/track-view', optionalAuthenticate, notificationController.trackView.bind(notificationController));

module.exports = router;

