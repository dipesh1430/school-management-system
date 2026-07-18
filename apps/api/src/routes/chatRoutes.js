const express = require('express');
const { sendMessage, getMessages, getContacts } = require('../controllers/chatController');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/contacts', getContacts);
router.get('/:contactId', getMessages);
router.post('/', sendMessage);

module.exports = router;
