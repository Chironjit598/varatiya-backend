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
 * @route   POST /api/messes/bachelor-flat
 * @desc    Create a Private Bachelor Flat (No public To-Let listing)
 * @access  Protected
 */
router.post('/bachelor-flat', (req, res, next) => {
  req.body = req.body || {};
  req.body.operatingMode = 'bachelor_flat';
  return messController.createMess(req, res, next);
});

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
 * @route   GET /api/messes/:messId/bazar
 * @desc    Get all bazar entries, item lists, and buyer breakdowns for transparency
 * @access  Protected
 */
router.get('/:messId/bazar', messController.getBazarEntries);
router.get('/:messId/bazar-entries', messController.getBazarEntries);

/**
 * @route   POST /api/messes/:messId/bazar
 * @desc    Add an itemized bazar entry & credit buyer's deposit (in bachelor_flat mode)
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

/**
 * @route   PATCH /api/messes/:messId/settings
 * @desc    Update Mess Settings (operatingMode: 'student_shared' | 'dhaka_centralized', mealsPerDay: 2 | 3)
 * @access  Protected
 */
router.patch('/:messId/settings', messController.updateMessSettings);

/**
 * @route   GET /api/messes/:messId/bazar-roster
 * @desc    Get Bazar Roster (transparent to all members)
 * @access  Protected
 */
router.get('/:messId/bazar-roster', messController.getBazarRoster);

/**
 * @route   POST /api/messes/:messId/bazar-roster
 * @desc    Set or replace complete 30-day Bazar Roster schedule
 * @access  Protected
 */
router.post('/:messId/bazar-roster', messController.setBazarRoster);

/**
 * @route   PUT /api/messes/:messId/bazar-roster/:entryId
 * @desc    Update a single Bazar Roster entry (assigned border or manager)
 * @access  Protected
 */
router.put('/:messId/bazar-roster/:entryId', messController.updateBazarRosterEntry);

/**
 * @route   DELETE /api/messes/:messId/bazar-roster/:entryId
 * @desc    Delete a single Bazar Roster entry
 * @access  Protected
 */
router.delete('/:messId/bazar-roster/:entryId', messController.deleteBazarRosterEntry);

/**
 * @route   GET /api/messes/:messId/cleaning-roster
 * @desc    Get Cleaning Roster (transparent to all members)
 * @access  Protected
 */
router.get('/:messId/cleaning-roster', messController.getCleaningRoster);

/**
 * @route   POST /api/messes/:messId/cleaning-roster
 * @desc    Set or replace complete Cleaning Roster schedule
 * @access  Protected
 */
router.post('/:messId/cleaning-roster', messController.setCleaningRoster);

/**
 * @route   PUT /api/messes/:messId/cleaning-roster/:entryId
 * @desc    Update a single Cleaning Roster entry
 * @access  Protected
 */
router.put('/:messId/cleaning-roster/:entryId', messController.updateCleaningRosterEntry);

/**
 * @route   DELETE /api/messes/:messId/cleaning-roster/:entryId
 * @desc    Delete a single Cleaning Roster entry
 * @access  Protected
 */
router.delete('/:messId/cleaning-roster/:entryId', messController.deleteCleaningRosterEntry);

/**
 * @route   GET /api/messes/:messId/development-fund
 * @desc    Get Development Fund breakdown (transparent to all members)
 * @access  Protected
 */
router.get('/:messId/development-fund', messController.getDevelopmentFund);

/**
 * @route   POST /api/messes/:messId/development-fund/config
 * @desc    Set monthly development fee per member
 * @access  Protected
 */
router.post('/:messId/development-fund/config', messController.setDevelopmentFundConfig);

/**
 * @route   POST /api/messes/:messId/development-fund/collections
 * @desc    Record member development fee payment
 * @access  Protected
 */
router.post('/:messId/development-fund/collections', messController.recordDevelopmentFeePayment);

/**
 * @route   POST /api/messes/:messId/development-fund/expenses
 * @desc    Record expense paid from development fund
 * @access  Protected
 */
router.post('/:messId/development-fund/expenses', messController.recordDevelopmentExpense);

/**
 * @route   DELETE /api/messes/:messId/development-fund/expenses/:expenseId
 * @desc    Delete expense entry
 * @access  Protected
 */
router.delete('/:messId/development-fund/expenses/:expenseId', messController.deleteDevelopmentExpense);

/**
 * @route   PATCH /api/messes/:messId/members/:memberId/role
 * @desc    Assign member role (controller, manager, meal_incharge, cleaning_incharge, utility_incharge, border)
 * @access  Protected
 */
router.patch('/:messId/members/:memberId/role', messController.setMemberRole);

/**
 * @route   POST /api/messes/:messId/members/:memberId/payments
 * @desc    Record granular payments (seat_rent, utility, meal_deposit, development_fee)
 * @access  Protected
 */
router.post('/:messId/members/:memberId/payments', messController.recordMemberPayment);

/**
 * @route   POST /api/messes/:messId/send-roster-reminders
 * @desc    Trigger day-before notifications for tomorrow's bazar and cleaning duties
 * @access  Protected
 */
router.post('/:messId/send-roster-reminders', messController.sendRosterReminders);

/**
 * @route   POST /api/messes/:messId/deposits
 * @desc    Record member deposit (category: meal, rent, utility) with role-based checks
 * @access  Protected
 */
router.post('/:messId/deposits', messController.recordDeposit);

/**
 * @route   GET /api/messes/:messId/deposits
 * @desc    Get deposit records for the mess
 * @access  Protected
 */
router.get('/:messId/deposits', messController.getDeposits);

/**
 * @route   GET /api/messes/:messId/deposits/summary
 * @desc    Get deposit financial summary (totalMealDeposited, totalBazarCost, cashInHand, memberMealDeposits)
 * @access  Protected
 */
router.get('/:messId/deposits/summary', messController.getDepositsSummary);

/**
 * @route   GET /api/messes/:messId/today-meals
 * @desc    Get today's active meal count per slot and list of active member IDs and names
 * @access  Protected
 */
router.get('/:messId/today-meals', messController.getTodayMeals);

module.exports = router;

