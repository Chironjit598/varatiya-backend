const express = require('express');
const adminController = require('./admin.controller');

const router = express.Router();

// Dashboard HTML view
router.get('/', adminController.renderDashboard.bind(adminController));
router.get('/dashboard', adminController.renderDashboard.bind(adminController));

// Admin APIs
router.get('/api/stats', adminController.getStats.bind(adminController));
router.post('/api/mode', adminController.setMode.bind(adminController));
router.post('/api/approve-user', adminController.approveUser.bind(adminController));

module.exports = router;

