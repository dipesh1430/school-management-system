const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  name: {
    type: String,
    required: true, // e.g., "Mid-Term", "Unit Test 1"
  },
  term: {
    type: String,
    default: 'Term 1', // e.g., "Term 1", "Term 2"
  },
  date: {
    type: Date,
    required: true,
  },
  subjects: [{
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    maxMarks: {
      type: Number,
      required: true,
    }
  }],
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Published'],
    default: 'Scheduled'
  }
}, { timestamps: true });

examSchema.index({ schoolId: 1, classId: 1 });

module.exports = mongoose.model('Exam', examSchema);
