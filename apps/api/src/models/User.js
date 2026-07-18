const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  role: { type: String, enum: ['superadmin', 'admin', 'principal', 'teacher', 'staff', 'parent', 'student'], required: true },
  name: { type: String, required: true },
  email: { type: String }, // Optional for students/staff
  phone: { type: String },
  passwordHash: { type: String, required: true },
  profilePic: { type: String },
  isActive: { type: Boolean, default: true },
  
  // Basic Demographics
  dob: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  identityProof: { type: String }, // Aadhar/PAN
  
  // Staff Details (Applies to Principal, Teacher, Staff)
  staffDetails: {
    jobCategory: {
      type: String,
      enum: [
        'Teaching', 
        'Administrative', 
        'Laboratory_Technical', 
        'Health_and_Safety', 
        'Housekeeping_Sanitation', 
        'Maintenance_Infrastructure', 
        'Transport'
      ]
    },
    designation: { type: String }, // e.g., "Physics Lab Attendant", "Principal"
    isPOCSOExempt: { type: Boolean, default: false },
    
    // Qualifications
    highestDegree: { type: String },
    bEdStatus: { type: String, enum: ['Completed', 'Pursuing', 'Not Applicable'] },
    universityNames: { type: String },
    graduationYear: { type: String },
    
    // Experience & Payroll
    totalTeachingExperience: { type: Number, default: 0 },
    adminExperience: { type: Number, default: 0 },
    previousSchool: { type: String },
    epfUanNumber: { type: String },
    salaryScaleType: { type: String, enum: ['KVS', 'State', 'Private'], default: 'Private' },
    
    // CBSE Compliance
    oasisId: { type: String },
    udiseMapped: { type: Boolean, default: false },
    cpdTrainingHours: { type: Number, default: 0 },
    
    // Document Vault (URLs)
    smcResolutionFileUrl: { type: String },
    affidavitFileUrl: { type: String },
    relievingLetterUrl: { type: String }
  }
}, { timestamps: true });

// Compound index to ensure uniqueness of email per school (if provided)
userSchema.index({ schoolId: 1, email: 1 }, { unique: true, partialFilterExpression: { email: { $exists: true, $ne: null, $type: "string" } } });
userSchema.index({ schoolId: 1, role: 1 });

module.exports = mongoose.model('User', userSchema);
