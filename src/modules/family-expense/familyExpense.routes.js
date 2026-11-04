const express = require('express');
const familyExpenseController = require('./familyExpense.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

/**
 * @route   GET /api/family-expenses
 * @desc    Get all family expenses for logged-in user
 * @access  Protected
 */
router.get('/', familyExpenseController.getExpenses);

/**
 * @route   POST /api/family-expenses
 * @desc    Add a new family expense
 * @access  Protected
 */
router.post('/', familyExpenseController.createExpense);

/**
 * @route   PATCH /api/family-expenses/:id/toggle-paid
 * @desc    Toggle paid/unpaid status of a family expense
 * @access  Protected
 */
router.patch('/:id/toggle-paid', familyExpenseController.togglePaid);

/**
 * @route   DELETE /api/family-expenses/:id
 * @desc    Delete a family expense item
 * @access  Protected
 */
router.delete('/:id', familyExpenseController.deleteExpense);

module.exports = router;

