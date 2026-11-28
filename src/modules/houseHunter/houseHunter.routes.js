const express = require('express');
const houseHunterController = require('./houseHunter.controller');
const { optionalAuthenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();

/**
 * Public / App Endpoints
 */
router.post('/request', optionalAuthenticate, houseHunterController.submitRequest.bind(houseHunterController));
router.post('/verify-payment', optionalAuthenticate, houseHunterController.submitPaymentVerification.bind(houseHunterController));
router.get('/payment/verify-status', optionalAuthenticate, houseHunterController.checkPaymentVerificationStatus.bind(houseHunterController));
router.post('/:id/payment', optionalAuthenticate, houseHunterController.submitPayment.bind(houseHunterController));
router.get('/my-requests', optionalAuthenticate, houseHunterController.getMyRequests.bind(houseHunterController));

module.exports = router;
