const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['holiday', 'exam', 'ptm', 'event'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String },
  targetClassIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }], // Empty means school-wide
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

eventSchema.index({ schoolId: 1, startDate: 1 });

module.exports = mongoose.model('Event', eventSchema);
