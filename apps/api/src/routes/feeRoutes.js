const express = require('express');
const { generateFee, getFees, markFeeAsPaid } = require('../controllers/feeController');
const { requireAuth, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.use(requireAuth);

// Finance routes
router.post('/generate', requireRole(['admin', 'superadmin', 'principal']), generateFee);
router.get('/', requireRole(['admin', 'superadmin', 'principal', 'student']), getFees);
router.patch('/:id/pay', requireRole(['admin', 'superadmin', 'principal', 'student']), markFeeAsPaid);

module.exports = router;
