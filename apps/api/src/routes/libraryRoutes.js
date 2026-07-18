const express = require('express');
const { getBooks, addBook, issueBook, returnBook } = require('../controllers/libraryController');
const { requireAuth, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', getBooks);
router.post('/', requireRole(['admin', 'superadmin', 'principal', 'librarian']), addBook);
router.post('/:id/issue', requireRole(['admin', 'superadmin', 'principal', 'librarian']), issueBook);
router.post('/:id/return', requireRole(['admin', 'superadmin', 'principal', 'librarian']), returnBook);

module.exports = router;
