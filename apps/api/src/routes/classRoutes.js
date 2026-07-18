const express = require('express');
const { createClass, getClasses, createSection, getSections } = require('../controllers/classController');
const { requireAuth, requireRole } = require('../middlewares/auth');

const router = express.Router();

// All class routes require auth
router.use(requireAuth);

// Classes are readable by all school staff
router.get('/', requireRole(['admin', 'superadmin', 'principal', 'teacher']), getClasses);
router.get('/:classId/sections', requireRole(['admin', 'superadmin', 'principal', 'teacher']), getSections);

// Only admins and principals can create classes/sections
router.post('/', requireRole(['admin', 'superadmin', 'principal']), createClass);
router.post('/:classId/sections', requireRole(['admin', 'superadmin', 'principal']), createSection);

module.exports = router;
