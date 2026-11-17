const express = require('express');
const adminController = require('./admin.controller');
const { requireAdminAuth, requireSuperAdminAuth } = require('./admin.middleware');

const router = express.Router();

// Dashboard HTML view
router.get('/', adminController.renderDashboard.bind(adminController));
router.get('/dashboard', adminController.renderDashboard.bind(adminController));

// Public Admin Login
router.post('/api/login', adminController.login.bind(adminController));

// Guarded Admin APIs
router.use('/api', requireAdminAuth);

// Overview Stats & Quick Actions
router.get('/api/stats', adminController.getStats.bind(adminController));
router.post('/api/mode', requireSuperAdminAuth, adminController.setMode.bind(adminController));
router.post('/api/approve-user', adminController.approveUser.bind(adminController));

// User Management
router.get('/api/users', adminController.getUsers.bind(adminController));
router.get('/api/users/:id/viewed-properties', adminController.getUserViewedProperties.bind(adminController));
router.post('/api/users/:id/toggle-paid', adminController.toggleUserPaid.bind(adminController));
router.post('/api/users/:id/reset-password', adminController.resetUserPassword.bind(adminController));
router.post('/api/users/:id/set-limit', adminController.setUserLimit.bind(adminController));
router.delete('/api/users/:id', adminController.deleteUser.bind(adminController));

// CRM Leads & Follow-ups
router.get('/api/crm/leads', adminController.getCrmLeads.bind(adminController));
router.post('/api/crm/lead', adminController.saveCrmLead.bind(adminController));

// Property / Post Management & Creation
router.get('/api/properties', adminController.getProperties.bind(adminController));
router.post('/api/properties', adminController.createProperty.bind(adminController));
router.post('/api/properties/:id/toggle-active', adminController.togglePropertyActive.bind(adminController));
router.delete('/api/properties/:id', adminController.deleteProperty.bind(adminController));
router.get('/api/locations', adminController.getLocations.bind(adminController));

// Reports Management
router.get('/api/reports', adminController.getReports.bind(adminController));
router.post('/api/reports/:id/resolve', adminController.resolveReport.bind(adminController));

// Push Notifications Broadcast & Logs
router.get('/api/notifications/audience-count', adminController.getAudienceCount.bind(adminController));
router.post('/api/notifications/send-push', adminController.sendPushNotification.bind(adminController));
router.get('/api/notifications/push-logs', adminController.getPushLogs.bind(adminController));

// App Configuration (Super Admin Only)
router.get('/api/config', requireSuperAdminAuth, adminController.getConfig.bind(adminController));
router.post('/api/config', requireSuperAdminAuth, adminController.updateConfig.bind(adminController));

module.exports = router;
