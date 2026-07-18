const express = require('express');
const { createSchool, getSchools, getMySchool, updateSchool, updateSchoolStatus, getPlatformAnalytics } = require('../controllers/schoolController');
const { requireAuth, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.use(requireAuth);

// Admin routes for their specific school
router.get('/me', requireRole(['admin', 'superadmin', 'principal']), getMySchool);
router.patch('/me', requireRole(['admin', 'superadmin', 'principal']), updateSchool);

// Superadmin only routes
router.post('/', requireRole(['superadmin']), createSchool);
router.get('/', requireRole(['superadmin']), getSchools);
router.get('/analytics', requireRole(['superadmin']), getPlatformAnalytics);
router.patch('/:id/status', requireRole(['superadmin']), updateSchoolStatus);

module.exports = router;
