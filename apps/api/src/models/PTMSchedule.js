const mongoose = require('mongoose');

const ptmScheduleSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  meetingProvider: {
    type: String,
    enum: ['Manual', 'Google Meet', 'Zoom', 'In-Person'],
    default: 'Manual',
  },
  meetingLink: {
    type: String,
  },
  slots: [{
    time: {
      type: String, // e.g., '09:00 AM'
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Available', 'Booked', 'Completed', 'Cancelled'],
      default: 'Available'
    }
  }]
}, { timestamps: true });

ptmScheduleSchema.index({ schoolId: 1, classId: 1, teacherId: 1, date: 1 });

module.exports = mongoose.model('PTMSchedule', ptmScheduleSchema);
