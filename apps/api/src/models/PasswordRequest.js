const mongoose = require('mongoose');

const passwordRequestSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The teacher
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The principal/admin
  resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('PasswordRequest', passwordRequestSchema);
