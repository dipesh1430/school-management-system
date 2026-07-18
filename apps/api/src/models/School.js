const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Morning", "Noon"
  startTime: { type: String, required: true }, // e.g. "07:30"
  endTime: { type: String, required: true }, // e.g. "13:30"
  defaultPeriodDuration: { type: Number, default: 40 }, // in minutes
  recessAfterPeriod: { type: Number, default: 4 },
  recessDuration: { type: Number, default: 30 }
}, { _id: false });

const schoolSchema = new mongoose.Schema({
  // 1. General Info
  name: { type: String, required: true },
  board: { type: String },
  address: { type: String },
  logoUrl: { type: String },
  subscriptionPlan: { type: String, enum: ['Basic', 'Pro', 'Enterprise'], default: 'Basic' },
  isActive: { type: Boolean, default: true },

  // 2. CBSE & Govt Compliance
  cbseAffiliationNumber: { type: String },
  schoolCode: { type: String },
  udiseCode: { type: String },
  affiliationStatus: { type: String, enum: ['Provisional', 'Permanent', 'Pending', 'Not Affiliated'], default: 'Not Affiliated' },
  affiliationPeriodFrom: { type: Date },
  affiliationPeriodTo: { type: Date },

  // 3. Academic & Shift Configs
  currentAcademicYear: { type: String, default: '2026-2027' },
  workingDays: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
  shifts: [shiftSchema],

  // 4. Algorithmic Timetable Constraints
  timetableConstraints: {
    maxWeeklyPeriodsPGT: { type: Number, default: 30 },
    maxWeeklyPeriodsTGT: { type: Number, default: 36 },
    maxWeeklyPeriodsPRT: { type: Number, default: 40 },
    preventConsecutivePeriods: { type: Boolean, default: true },
    allowUnassignedFallbacks: { type: Boolean, default: true }
  },

  // 5. Grading Schema
  gradingSchema: {
    system: { type: String, enum: ['CBSE 9-Point Scale', 'CCE Pattern', 'Custom Percentage'], default: 'CBSE 9-Point Scale' },
    passingThreshold: { type: Number, default: 33 }
  }

}, { timestamps: true });

module.exports = mongoose.model('School', schoolSchema);
