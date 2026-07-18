const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  periodNumber: { type: Number, required: true },
  subject: { type: String, default: '' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true }
});

const dailyScheduleSchema = new mongoose.Schema({
  dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true },
  periods: [periodSchema]
});

const timetableDraftSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  schedule: [dailyScheduleSchema],
  status: { type: String, enum: ['draft', 'published'], default: 'draft' }
}, { timestamps: true });

module.exports = mongoose.model('TimetableDraft', timetableDraftSchema);
