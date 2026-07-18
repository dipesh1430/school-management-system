const mongoose = require('mongoose');

const substitutionSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
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
  periodNumber: {
    type: Number,
    required: true
  },
  originalTeacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  substituteTeacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Ensure a single substitution per period, per class, per section, per date
substitutionSchema.index({ schoolId: 1, date: 1, classId: 1, sectionId: 1, periodNumber: 1 }, { unique: true });

module.exports = mongoose.model('Substitution', substitutionSchema);
