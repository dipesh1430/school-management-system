const express = require('express');
const { markAttendance, getAttendance } = require('../controllers/attendanceController');
const { requireAuth, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.use(requireAuth);

// Teachers and Admins can mark attendance
router.post('/', requireRole(['admin', 'superadmin', 'principal', 'teacher']), markAttendance);

// Anyone in the school can view attendance
router.get('/', getAttendance);

module.exports = router;
