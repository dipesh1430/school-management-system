const express = require('express');
const { createNotice, getNotices, deleteNotice, createEvent, getEvents, deleteEvent, exportEventsIcs } = require('../controllers/communicationController');
const { requireAuth, requireRole } = require('../middlewares/auth');

const router = express.Router();

// Public ICS Feed
router.get('/events/feed/:schoolId.ics', exportEventsIcs);

router.use(requireAuth);

// Notices
router.post('/notices', requireRole(['admin', 'superadmin', 'teacher', 'principal']), createNotice);
router.get('/notices', getNotices);
router.delete('/notices/:id', requireRole(['admin', 'superadmin', 'principal']), deleteNotice);

// Events
router.post('/events', requireRole(['admin', 'superadmin', 'principal']), createEvent);
router.get('/events', getEvents);
router.delete('/events/:id', requireRole(['admin', 'superadmin', 'principal']), deleteEvent);

module.exports = router;
