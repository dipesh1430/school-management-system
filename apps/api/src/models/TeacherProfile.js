const mongoose = require('mongoose');

const teacherProfileSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  subjectIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  assignedClasses: [{
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' }
  }],

  // Compliance & Demographics
  gender: { type: String, enum: ['male', 'female', 'other'] },
  fatherOrHusbandName: { type: String },
  dob: { type: Date },
  aadhaarNumber: { type: String },
  designation: { type: String },
  teacherCode: { type: String },
  
  // Qualifications & Experience
  academicQualifications: { type: String }, // e.g., "B.Sc, M.Sc - Delhi University"
  professionalQualifications: { type: String }, // e.g., "B.Ed, D.El.Ed"
  tetStatus: { type: Boolean, default: false },
  tetScore: { type: String },
  dateOfAppointment: { type: Date },
  experienceYears: { type: Number, min: 0 },
  trainingHours: { type: String },
  // For timetable auto-generation
    assignedShift: {
      type: String,
      enum: ['Morning', 'Afternoon'],
      default: 'Morning'
    },
    streamSpecialization: {
      type: String,
      enum: ['General', 'Science', 'Commerce', 'Arts'],
      default: 'General'
    }
}, { timestamps: true });

// Multi-tenant indexing
teacherProfileSchema.index({ schoolId: 1 });

module.exports = mongoose.model('TeacherProfile', teacherProfileSchema);
