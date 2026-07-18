const express = require('express');
const { createSchedule, getSchedules, bookSlot } = require('../controllers/ptmController');
const { requireAuth, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', getSchedules);
router.post('/', requireRole(['teacher', 'admin', 'principal', 'superadmin']), createSchedule);
router.post('/:scheduleId/slots/:slotId/book', bookSlot);

module.exports = router;
