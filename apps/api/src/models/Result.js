const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true,
  },
  assessmentType: {
    type: String,
    enum: ['Numerical', 'Qualitative'],
    default: 'Numerical'
  },
  marks: [{
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    marksObtained: {
      type: Number,
      required: true,
    },
    remarks: {
      type: String,
    }
  }],
  descriptiveFeedback: {
    type: String,
  },
  grade: {
    type: String, // e.g., A+, A, B, etc.
  }
}, { timestamps: true });

resultSchema.index({ schoolId: 1, examId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
