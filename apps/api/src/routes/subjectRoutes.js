const express = require('express');
const router = express.Router();
const { getSubjects } = require('../controllers/subjectController');
const { requireAuth } = require('../middlewares/auth');

router.use(requireAuth); // Ensure user is authenticated and req.schoolId is set

router.get('/', getSubjects);

module.exports = router;
