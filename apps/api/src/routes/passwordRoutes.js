const express = require('express');
const { forgotPassword, resetStudentPassword, getTeacherRequests, approveTeacherRequest } = require('../controllers/passwordController');
const { requireAuth, requireRole } = require('../middlewares/auth');

const router = express.Router();

// Public routes for requesting and doing the reset via token
router.post('/forgot', forgotPassword);
router.post('/reset/:token', resetStudentPassword);

// Protected routes for Principal/Admin to handle manual teacher requests
router.use(requireAuth);
router.get('/requests', requireRole(['principal', 'admin', 'superadmin']), getTeacherRequests);
router.post('/requests/:requestId/approve', requireRole(['principal', 'admin', 'superadmin']), approveTeacherRequest);

module.exports = router;
