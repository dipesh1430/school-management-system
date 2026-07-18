const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  audience: { type: String, enum: ['all', 'teachers', 'parents', 'students', 'specific_class'], default: 'all' },
  targetClassIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }], // Used if audience is specific_class
  attachments: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

noticeSchema.index({ schoolId: 1, createdAt: -1 });

module.exports = mongoose.model('Notice', noticeSchema);
