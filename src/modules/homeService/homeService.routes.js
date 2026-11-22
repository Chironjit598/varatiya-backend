const express = require('express');
const homeServiceController = require('./homeService.controller');
const { optionalAuthenticate, authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

/**
 * Public / App Endpoints
 */
router.post('/booking', optionalAuthenticate, homeServiceController.createBooking.bind(homeServiceController));
router.get('/my-bookings', optionalAuthenticate, homeServiceController.getMyBookings.bind(homeServiceController));
router.post('/booking/:id/respond-quote', optionalAuthenticate, homeServiceController.respondToQuote.bind(homeServiceController));

/**
 * Admin Endpoints
 */
router.get('/admin/all', authenticate, authorize('superadmin', 'admin', 'moderator'), homeServiceController.getAdminBookings.bind(homeServiceController));
router.post('/admin/:id/quote', authenticate, authorize('superadmin', 'admin', 'moderator'), homeServiceController.quotePriceAdmin.bind(homeServiceController));
router.patch('/admin/:id/status', authenticate, authorize('superadmin', 'admin', 'moderator'), homeServiceController.updateBookingStatus.bind(homeServiceController));

module.exports = router;
