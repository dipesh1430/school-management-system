const mongoose = require('mongoose');

const libraryBookSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String },
  totalCopies: { type: Number, required: true, default: 1 },
  availableCopies: { type: Number, required: true, default: 1 },
  
  // Track who currently has the book
  currentBorrowers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    issuedAt: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true }
  }]
}, { timestamps: true });

libraryBookSchema.index({ schoolId: 1, title: 1 });

module.exports = mongoose.model('LibraryBook', libraryBookSchema);
