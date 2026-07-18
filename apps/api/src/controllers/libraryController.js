const LibraryBook = require('../models/LibraryBook');

const getBooks = async (req, res) => {
  try {
    const books = await LibraryBook.find({ schoolId: req.schoolId }).populate('currentBorrowers.userId', 'name role');
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addBook = async (req, res) => {
  try {
    const { title, author, isbn, totalCopies } = req.body;
    const newBook = new LibraryBook({
      schoolId: req.schoolId,
      title,
      author,
      isbn,
      totalCopies: totalCopies || 1,
      availableCopies: totalCopies || 1
    });
    await newBook.save();
    res.status(201).json({ message: 'Book added successfully', book: newBook });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const issueBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, dueDate } = req.body;

    const book = await LibraryBook.findOne({ _id: id, schoolId: req.schoolId });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.availableCopies < 1) return res.status(400).json({ message: 'No copies available' });

    // Check if user already borrowed this book
    if (book.currentBorrowers.some(b => b.userId.toString() === userId)) {
      return res.status(400).json({ message: 'User has already borrowed this book' });
    }

    book.currentBorrowers.push({ userId, dueDate: new Date(dueDate) });
    book.availableCopies -= 1;
    await book.save();

    res.json({ message: 'Book issued successfully', book });
  } catch (error) {
    console.error('Error issuing book:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const returnBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const book = await LibraryBook.findOne({ _id: id, schoolId: req.schoolId });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const borrowerIndex = book.currentBorrowers.findIndex(b => b.userId.toString() === userId);
    if (borrowerIndex === -1) {
      return res.status(400).json({ message: 'User has not borrowed this book' });
    }

    book.currentBorrowers.splice(borrowerIndex, 1);
    book.availableCopies += 1;
    await book.save();

    res.json({ message: 'Book returned successfully', book });
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getBooks, addBook, issueBook, returnBook };
