const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  // subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }, // Will add later
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherProfile', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  attachments: [{ type: String }], // Array of URLs
  dueDate: { type: Date, required: true },
}, { timestamps: true });

homeworkSchema.index({ schoolId: 1, classId: 1, sectionId: 1 });

module.exports = mongoose.model('Homework', homeworkSchema);
