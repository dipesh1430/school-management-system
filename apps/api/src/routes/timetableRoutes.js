const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const { requireAuth, requireRole } = require('../middlewares/auth');

router.use(requireAuth);

// Timetable Background Generation
router.post('/generate', requireRole(['superadmin', 'admin']), timetableController.triggerTimetableGeneration);
router.get('/status/:jobId', requireRole(['superadmin', 'admin']), timetableController.checkJobStatus);
router.get('/draft/:draftId', requireRole(['superadmin', 'admin']), timetableController.getDraft);

// Daily Substitutions
router.get('/substitutions/daily', requireRole(['superadmin', 'admin', 'principal']), timetableController.getSubstitutions);
router.post('/substitutions/daily', requireRole(['superadmin', 'admin', 'principal']), timetableController.saveSubstitution);

// Lunch & Policies
router.get('/lunch/:classId/:sectionId', timetableController.getLunchMenus);
router.post('/lunch', requireRole(['superadmin', 'admin', 'principal']), timetableController.saveLunchMenu);

// Timetable rules (Only Admins and Teachers can modify, Students can read)
router.get('/:classId/:sectionId', timetableController.getTimetable);
router.post('/', requireRole(['superadmin', 'admin', 'teacher', 'principal']), timetableController.saveTimetable);

// Approval & States Workflow
router.get('/status/master/:classId/:sectionId', requireRole(['superadmin', 'admin', 'principal', 'teacher']), timetableController.getTimetableStatus);
router.put('/status/master/:classId/:sectionId', requireRole(['superadmin', 'admin', 'principal']), timetableController.updateTimetableStatus);
router.delete('/revoke/master/:classId/:sectionId', requireRole(['superadmin', 'admin']), timetableController.revokeTimetable);

module.exports = router;
