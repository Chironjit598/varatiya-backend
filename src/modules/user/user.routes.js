const express = require('express');
const userController = require('./user.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();

/**
 * @route   GET /api/users/search?q=<query>
 * @desc    Search registered users by phone number or name
 * @access  Protected
 */
router.get('/search', authenticate, userController.searchUsers);

/**
 * @route   GET /api/users/by-phone/:phone
 * @desc    Lookup registered user by phone number
 * @access  Protected
 */
router.get('/by-phone/:phone', authenticate, userController.getUserByPhone);

/**
 * @route   POST /api/users/mode
 * @desc    Set or convert user's active mode ('family' or 'general')
 * @access  Protected
 */
router.post('/mode', authenticate, userController.setUserMode);

module.exports = router;

