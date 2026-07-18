const express = require('express');
const { getRoutes, createRoute, assignStudentToRoute, removeStudentFromRoute } = require('../controllers/transportController');
const { requireAuth, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', getRoutes);
router.post('/', requireRole(['admin', 'superadmin', 'principal']), createRoute);
router.post('/:id/assign', requireRole(['admin', 'superadmin', 'principal']), assignStudentToRoute);
router.post('/:id/remove', requireRole(['admin', 'superadmin', 'principal']), removeStudentFromRoute);

module.exports = router;
