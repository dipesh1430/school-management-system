const express = require('express');
const { createHomework, getHomework, submitHomework, getSubmissions, gradeSubmission } = require('../controllers/homeworkController');
const { requireAuth, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.use(requireAuth);

router.post('/', requireRole(['admin', 'superadmin', 'principal', 'teacher']), createHomework);
router.get('/', getHomework);

// Submissions
router.post('/:id/submit', requireRole(['student']), submitHomework);
router.get('/:id/submissions', requireRole(['admin', 'superadmin', 'principal', 'teacher']), getSubmissions);
router.patch('/submissions/:submissionId/grade', requireRole(['admin', 'superadmin', 'principal', 'teacher']), gradeSubmission);

module.exports = router;
