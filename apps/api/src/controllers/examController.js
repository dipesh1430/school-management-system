const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Class = require('../models/Class');
const StudentProfile = require('../models/StudentProfile');

exports.createExam = async (req, res) => {
  try {
    const { classId, name, term, date, subjects } = req.body;
    
    const exam = new Exam({
      schoolId: req.schoolId,
      classId,
      name,
      term,
      date,
      subjects
    });

    await exam.save();
    res.status(201).json(exam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find({ schoolId: req.schoolId })
      .populate('classId', 'name')
      .populate('subjects.subjectId', 'name')
      .sort({ createdAt: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateExamStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const exam = await Exam.findOneAndUpdate(
      { _id: id, schoolId: req.schoolId },
      { status },
      { new: true }
    );
    
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json(exam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Result Controllers
exports.submitResults = async (req, res) => {
  try {
    const { examId } = req.params;
    const { results } = req.body; // Array of { studentId, marks: [{ subjectId, marksObtained, remarks }] }

    // Bulk upsert results
    const operations = results.map(result => ({
      updateOne: {
        filter: { 
          schoolId: req.schoolId, 
          examId, 
          studentId: result.studentId 
        },
        update: { $set: { marks: result.marks, assessmentType: result.assessmentType || 'Numerical' } },
        upsert: true
      }
    }));

    await Result.bulkWrite(operations);
    res.json({ message: 'Results saved successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getResultsByExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const results = await Result.find({ schoolId: req.schoolId, examId })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name' }
      })
      .populate('marks.subjectId', 'name');
      
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentReportCard = async (req, res) => {
  try {
    const { studentId, examId } = req.params;
    
    const result = await Result.findOne({ schoolId: req.schoolId, studentId, examId })
      .populate({
        path: 'studentId',
        populate: [
          { path: 'userId', select: 'name profilePic' },
          { path: 'classId', select: 'name stream' },
          { path: 'sectionId', select: 'name' }
        ]
      })
      .populate('examId', 'name term date subjects')
      .populate('marks.subjectId', 'name');
      
    if (!result) return res.status(404).json({ message: 'Result not found' });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
