const express = require('express');
const messController = require('./mess.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

/**
 * @route   GET /api/messes/managed
 * @desc    Get all ManagedMess documents where user is Manager or Border/Member
 * @access  Protected
 */
router.get('/managed', messController.getManagedMesses);

/**
 * @route   GET /api/messes
 * @desc    Alias for GET /api/messes/managed
 * @access  Protected
 */
router.get('/', messController.getManagedMesses);

/**
 * @route   POST /api/messes
 * @desc    Create a new ManagedMess or Bachelor Mess Group
 * @access  Protected
 */
router.post('/', messController.createMess);

/**
 * @route   POST /api/messes/leave
 * @desc    Leave current mess, vacate seat, and reset account to General Mode
 * @access  Protected
 */
router.post('/leave', messController.leaveMessOrResetMode);

/**
 * @route   GET /api/messes/:messId
 * @desc    Get a single ManagedMess by ID
 * @access  Protected
 */
router.get('/:messId', messController.getMessById);

/**
 * @route   PUT /api/messes/:messId
 * @desc    Edit Mess details, rooms, and utilities (syncs with Property)
 * @access  Protected
 */
router.put('/:messId', messController.updateMess);

/**
 * @route   POST /api/messes/:messId/assign-border
 * @desc    Assign a registered user to a specific seat by phone number
 * @access  Protected
 */
router.post('/:messId/assign-border', messController.assignBorder);

/**
 * @route   POST /api/messes/:messId/vacate-seat
 * @desc    Vacate a seat in a ManagedMess
 * @access  Protected
 */
router.post('/:messId/vacate-seat', messController.vacateSeat);

/**
 * @route   POST /api/messes/:messId/shared-bills
 * @desc    Add a shared monthly utility bill
 * @access  Protected
 */
router.post('/:messId/shared-bills', messController.addSharedBill);

/**
 * @route   DELETE /api/messes/:messId/shared-bills/:billId
 * @desc    Delete a shared monthly utility bill
 * @access  Protected
 */
router.delete('/:messId/shared-bills/:billId', messController.deleteSharedBill);

/**
 * @route   POST /api/messes/:messId/notices
 * @desc    Post a notice to the mess board
 * @access  Protected
 */
router.post('/:messId/notices', messController.addNotice);

/**
 * @route   DELETE /api/messes/:messId/notices/:noticeId
 * @desc    Delete a notice from the mess board
 * @access  Protected
 */
router.delete('/:messId/notices/:noticeId', messController.deleteNotice);

/**
 * @route   PATCH /api/messes/:messId/meals-per-day
 * @desc    Configure 2 or 3 meals per day
 * @access  Protected
 */
router.patch('/:messId/meals-per-day', messController.updateMealsPerDay);

/**
 * @route   PATCH /api/messes/:messId/members/:memberId/toggle-slot
 * @desc    Toggle a member's meal slot for today or a specific date
 * @access  Protected
 */
router.patch('/:messId/members/:memberId/toggle-slot', messController.toggleMemberSlot);

/**
 * @route   POST /api/messes/:messId/bazar
 * @desc    Add an itemized bazar entry & credit buyer's deposit
 * @access  Protected
 */
router.post('/:messId/bazar', messController.addBazarEntry);

/**
 * @route   DELETE /api/messes/:messId/bazar/:bazarId
 * @desc    Delete a bazar entry, deduct from buyer deposit & recompute financial metrics
 * @access  Protected
 */
router.delete('/:messId/bazar/:bazarId', messController.deleteBazarEntry);

/**
 * @route   POST /api/messes/:messId/members/:memberId/deposit
 * @desc    Add deposit amount for a mess member
 * @access  Protected
 */
router.post('/:messId/members/:memberId/deposit', messController.addMemberDeposit);

/**
 * @route   POST /api/messes/:messId/members
 * @desc    Add a registered user to Bachelor Mess by phone number
 * @access  Protected
 */
router.post('/:messId/members', messController.addMember);

/**
 * @route   DELETE /api/messes/:messId/members/:memberId
 * @desc    Remove a member from Bachelor Mess
 * @access  Protected
 */
router.delete('/:messId/members/:memberId', messController.removeMember);

/**
 * @route   PATCH /api/messes/:messId/manager
 * @desc    Change Mess Manager role
 * @access  Protected
 */
router.patch('/:messId/manager', messController.setMessManager);

/**
 * @route   POST /api/messes/:messId/meal-requests
 * @desc    Submit a meal cancellation/correction request
 * @access  Protected
 */
router.post('/:messId/meal-requests', messController.createMealRequest);

/**
 * @route   PATCH /api/messes/:messId/meal-requests/:requestId/resolve
 * @desc    Approve or reject a meal request
 * @access  Protected
 */
router.patch(
  '/:messId/meal-requests/:requestId/resolve',
  messController.resolveMealRequest
);

module.exports = router;

