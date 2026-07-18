const express = require('express');
const { applyLeave, getLeaves, updateLeaveStatus } = require('../controllers/leaveController');
const { requireAuth, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.use(requireAuth);

router.post('/', applyLeave);
router.get('/', getLeaves);
router.patch('/:id/status', requireRole(['admin', 'superadmin', 'principal']), updateLeaveStatus);

module.exports = router;
