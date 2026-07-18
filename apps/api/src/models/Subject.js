const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  stage: {
    type: String,
    enum: ['foundational', 'preparatory', 'middle', 'secondary', 'senior-secondary'],
    required: true
  },
  category: {
    type: String,
    enum: ['major', 'minor', 'core', 'elective', 'skill', 'co-scholastic'],
    required: true
  },
  code: {
    type: String // Optional CBSE subject code if applicable
  }
}, { timestamps: true });

subjectSchema.index({ schoolId: 1, name: 1, stage: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
