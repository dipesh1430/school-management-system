const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  rollNo: { type: String, required: true },
  admissionNo: { type: String, required: true },
  dob: { type: Date, required: true },
  parentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  academicYear: { type: String, required: true },
  
  // Compliance & Demographics
  gender: { type: String, enum: ['male', 'female', 'other'] },
  motherName: { type: String },
  fatherName: { type: String },
  guardianName: { type: String },
  category: { type: String, enum: ['general', 'sc', 'st', 'obc'] },
  bloodGroup: { type: String },
  cwsnStatus: { type: Boolean, default: false },
  aadhaarNumber: { type: String },
  apaarId: { type: String },
  pen: { type: String },
  subjectsChosen: [{ type: String }],
  
  // Documentation Flags
  hasTransferCertificate: { type: Boolean, default: false },
  hasMarkSheet: { type: Boolean, default: false },
  hasMigrationCertificate: { type: Boolean, default: false },
  hasBirthCertificate: { type: Boolean, default: false }
}, { timestamps: true });

// Multi-tenant indexing
studentProfileSchema.index({ schoolId: 1, classId: 1, sectionId: 1 });
studentProfileSchema.index({ schoolId: 1, admissionNo: 1 }, { unique: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
