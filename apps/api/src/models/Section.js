const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  name: { type: String, required: true }, // e.g., "A", "B", "C"
}, { timestamps: true });

// Compound index to ensure section names are unique within a class
sectionSchema.index({ schoolId: 1, classId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);
