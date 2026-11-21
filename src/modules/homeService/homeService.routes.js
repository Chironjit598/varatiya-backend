const express = require('express');
const homeServiceController = require('./homeService.controller');
const { optionalAuthenticate, authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

/**
 * Public / App Endpoints
 */
router.post('/booking', optionalAuthenticate, homeServiceController.createBooking.bind(homeServiceController));
router.get('/my-bookings', optionalAuthenticate, homeServiceController.getMyBookings.bind(homeServiceController));

/**
 * Admin Endpoints
 */
router.get('/admin/all', authenticate, authorize('superadmin', 'admin', 'moderator'), homeServiceController.getAdminBookings.bind(homeServiceController));
router.patch('/admin/:id/status', authenticate, authorize('superadmin', 'admin', 'moderator'), homeServiceController.updateBookingStatus.bind(homeServiceController));

module.exports = router;
