const express = require('express');
const { createStudent, createTeacher, createUser, getUsers, getStudentRoster, getStudentsByClass, getUserProfile } = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middlewares/auth');

const router = express.Router();

// All authenticated users can get their own profile
const { getMyProfile } = require('../controllers/userController');
router.get('/me/profile', requireAuth, getMyProfile);

// Most user management is for Admin/Principal/Superadmin
router.use(requireAuth, requireRole(['admin', 'superadmin', 'principal']));

router.get('/', getUsers);
router.post('/', createUser);
router.get('/:id/profile', getUserProfile);
router.get('/students/roster', getStudentRoster);
router.get('/students/class', getStudentsByClass);
router.post('/students', createStudent);
router.post('/teachers', createTeacher);

module.exports = router;
