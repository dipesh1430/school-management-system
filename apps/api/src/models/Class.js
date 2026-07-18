const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  name: { type: String, required: true }, // e.g., "1", "10", "12"
  stream: { type: String, enum: ['Science', 'Commerce', 'Arts', null], default: null }, // Only for 11-12
  academicYear: { type: String, required: true }, // e.g., "2026-2027"
  stage: { type: String, enum: ['foundational', 'preparatory', 'middle', 'secondary'], required: true },
  shift: { type: String, enum: ['morning', 'noon'], required: true },
  gradingType: { type: String, enum: ['holistic', 'marks'], required: true }
}, { timestamps: true });

// Compound index to ensure class names are unique within a school's academic year and stream
classSchema.index({ schoolId: 1, name: 1, stream: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);
