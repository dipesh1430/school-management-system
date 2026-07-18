const express = require('express');
const { 
  createExam, 
  getExams, 
  updateExamStatus,
  submitResults,
  getResultsByExam,
  getStudentReportCard 
} = require('../controllers/examController');
const { requireAuth, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', getExams);
router.post('/', requireRole(['superadmin', 'admin', 'principal']), createExam);
router.patch('/:id/status', requireRole(['superadmin', 'admin', 'principal']), updateExamStatus);

router.get('/:examId/results', requireRole(['superadmin', 'admin', 'principal', 'teacher']), getResultsByExam);
router.post('/:examId/results', requireRole(['superadmin', 'admin', 'principal', 'teacher']), submitResults);

router.get('/report-card/:examId/:studentId', getStudentReportCard);

module.exports = router;
