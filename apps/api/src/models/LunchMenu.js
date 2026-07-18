const mongoose = require('mongoose');

const lunchMenuSchema = new mongoose.Schema({
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
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true
  },
  foodItems: {
    type: [String],
    default: []
  },
  rules: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Ensure unique menu per school per class per section per day
lunchMenuSchema.index({ schoolId: 1, classId: 1, sectionId: 1, dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model('LunchMenu', lunchMenuSchema);
