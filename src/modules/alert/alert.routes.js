const express = require('express');
const alertController = require('./alert.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

/**
 * @route   GET /api/alerts
 * @desc    Get all rental alerts for logged-in user
 * @access  Protected
 */
router.get('/', alertController.getAlerts);

/**
 * @route   POST /api/alerts
 * @desc    Create a new rental alert
 * @access  Protected
 */
router.post('/', alertController.createAlert);

/**
 * @route   PATCH /api/alerts/:id/toggle
 * @desc    Toggle alert enabled status
 * @access  Protected
 */
router.patch('/:id/toggle', alertController.toggleAlert);

/**
 * @route   DELETE /api/alerts/:id
 * @desc    Delete an alert subscription
 * @access  Protected
 */
router.delete('/:id', alertController.deleteAlert);

module.exports = router;

