const mongoose = require('mongoose');

const subjectGroupSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  stream: { type: String, enum: ['Science', 'Commerce', 'Arts'], required: true },
  mandatorySubjects: [{ type: String }],
  electiveOptions: [{ type: String }],
  minimumTotalSubjects: { type: Number, default: 5 }
}, { timestamps: true });

subjectGroupSchema.index({ schoolId: 1, classId: 1, stream: 1 }, { unique: true });

module.exports = mongoose.model('SubjectGroup', subjectGroupSchema);
