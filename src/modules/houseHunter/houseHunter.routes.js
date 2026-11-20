const express = require('express');
const houseHunterController = require('./houseHunter.controller');
const { optionalAuthenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();

/**
 * Public / App Endpoints
 */
router.post('/request', optionalAuthenticate, houseHunterController.submitRequest.bind(houseHunterController));
router.get('/my-requests', optionalAuthenticate, houseHunterController.getMyRequests.bind(houseHunterController));

module.exports = router;
