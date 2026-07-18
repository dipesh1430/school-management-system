const mongoose = require('mongoose');

const homeworkSubmissionSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
  homeworkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Homework', required: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fileUrl: { type: String },
  textAnswer: { type: String },
  status: { type: String, enum: ['Submitted', 'Graded'], default: 'Submitted' },
  grade: { type: String },
  remark: { type: String },
}, { timestamps: true });

// Ensure a student can only submit once per homework (we can update their submission instead)
homeworkSubmissionSchema.index({ homeworkId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('HomeworkSubmission', homeworkSubmissionSchema);
