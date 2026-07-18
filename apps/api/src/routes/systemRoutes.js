const express = require('express');
const { search } = require('../controllers/searchController');
const { getLogs } = require('../controllers/logController');
const { getSystemHealth } = require('../controllers/healthController');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/search', search);
router.get('/logs', getLogs);
router.get('/health', getSystemHealth);

module.exports = router;
