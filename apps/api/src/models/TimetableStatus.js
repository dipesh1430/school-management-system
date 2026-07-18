const mongoose = require('mongoose');

const timetableStatusSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'published', 'rejected'],
    default: 'draft'
  },
  remarks: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Ensure unique status per class per section
timetableStatusSchema.index({ schoolId: 1, classId: 1, sectionId: 1 }, { unique: true });

module.exports = mongoose.model('TimetableStatus', timetableStatusSchema);
