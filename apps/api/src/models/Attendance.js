const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  date: { type: Date, required: true },
  records: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile' },
    status: { type: String, enum: ['present', 'absent', 'late', 'half-day'], required: true }
  }]
}, { timestamps: true });

// Ensure we don't have duplicate attendance records for the same class/section on the same day
attendanceSchema.index({ schoolId: 1, classId: 1, sectionId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
