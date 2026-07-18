const Homework = require('../models/Homework');
const HomeworkSubmission = require('../models/HomeworkSubmission');

const createHomework = async (req, res) => {
  try {
    const { classId, sectionId, title, description, dueDate, attachments } = req.body;
    const schoolId = req.schoolId;
    
    // Use the authenticated user's ID as the teacher/creator ID
    const teacherId = req.user._id;

    if (!classId || !sectionId || !title || !description || !dueDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newHomework = new Homework({
      schoolId,
      classId,
      sectionId,
      teacherId,
      title,
      description,
      dueDate,
      attachments: attachments || []
    });

    await newHomework.save();
    res.status(201).json({ message: 'Homework assigned', homework: newHomework });
  } catch (error) {
    console.error('Error creating homework:', error);
    res.status(500).json({ message: 'Server error while assigning homework' });
  }
};

const getHomework = async (req, res) => {
  try {
    const { classId, sectionId } = req.query;
    const schoolId = req.schoolId;

    if (!classId || !sectionId) {
      return res.status(400).json({ message: 'classId and sectionId are required' });
    }

    const homeworkList = await Homework.find({ schoolId, classId, sectionId }).sort({ dueDate: 1 });
    
    // If student, attach their submission status to each homework
    if (req.user.role === 'student') {
      const homeworkIds = homeworkList.map(h => h._id);
      const submissions = await HomeworkSubmission.find({ homeworkId: { $in: homeworkIds }, studentId: req.user._id });
      
      const enrichedHomeworkList = homeworkList.map(hw => {
        const sub = submissions.find(s => s.homeworkId.toString() === hw._id.toString());
        return {
          ...hw.toObject(),
          mySubmission: sub || null
        };
      });
      return res.status(200).json(enrichedHomeworkList);
    }

    res.status(200).json(homeworkList);
  } catch (error) {
    console.error('Error fetching homework:', error);
    res.status(500).json({ message: 'Server error while fetching homework' });
  }
};

const submitHomework = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileUrl, textAnswer } = req.body;
    const schoolId = req.schoolId;
    const studentId = req.user._id;

    if (!fileUrl && !textAnswer) {
      return res.status(400).json({ message: 'Please provide either a fileUrl or textAnswer' });
    }

    const submission = await HomeworkSubmission.findOneAndUpdate(
      { homeworkId: id, studentId, schoolId },
      { fileUrl, textAnswer, status: 'Submitted' },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: 'Homework submitted successfully', data: submission });
  } catch (error) {
    console.error('Error submitting homework:', error);
    res.status(500).json({ message: 'Server error while submitting homework' });
  }
};

const getSubmissions = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.schoolId;

    const submissions = await HomeworkSubmission.find({ homeworkId: id, schoolId })
      .populate('studentId', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Server error while fetching submissions' });
  }
};

const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, remark } = req.body;
    const schoolId = req.schoolId;

    const submission = await HomeworkSubmission.findOne({ _id: submissionId, schoolId });
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.grade = grade;
    submission.remark = remark;
    submission.status = 'Graded';
    await submission.save();

    res.status(200).json({ message: 'Submission graded successfully', data: submission });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ message: 'Server error while grading submission' });
  }
};

module.exports = { createHomework, getHomework, submitHomework, getSubmissions, gradeSubmission };
