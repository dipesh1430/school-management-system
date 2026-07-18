const FeeRecord = require('../models/FeeRecord');
const StudentProfile = require('../models/StudentProfile');
const { createLog } = require('./logController');
const User = require('../models/User');

const generateFee = async (req, res) => {
  try {
    const { classId, title, amount, dueDate, studentId } = req.body;
    const schoolId = req.schoolId;

    if (!title || !amount || !dueDate) {
      return res.status(400).json({ message: 'Title, amount, and due date are required' });
    }

    const feesToCreate = [];

    if (studentId) {
      // Generate for a single student
      feesToCreate.push({
        schoolId,
        studentId,
        classId,
        title,
        amount,
        dueDate
      });
    } else if (classId) {
      // Generate for entire class
      const students = await StudentProfile.find({ schoolId, classId });
      
      for (const student of students) {
        feesToCreate.push({ schoolId, studentId: student.userId, classId, title, amount, dueDate });
      }
    } else {
      return res.status(400).json({ message: 'Either classId or studentId must be provided' });
    }

    const feeRecords = await FeeRecord.insertMany(feesToCreate);

    // Emit System Log
    await createLog(req.schoolId, 'Fees Generated', `Generated ${feesToCreate.length} fee invoices for ${title}`, 'info');

    res.status(201).json({ message: `Successfully generated ${feesToCreate.length} fee records`, records: feeRecords });
  } catch (error) {
    console.error('Error generating fees:', error);
    res.status(500).json({ message: 'Server error while generating fees' });
  }
};

const getFees = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    
    // Privacy Lock: Students can only query their own fees
    const query = { schoolId };
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    }

    // Populate the student info (User model)
    const fees = await FeeRecord.find(query)
      .populate('studentId', 'name email')
      .populate('classId', 'name stream')
      .sort({ createdAt: -1 });
    
    res.status(200).json(fees);
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({ message: 'Server error while fetching fees' });
  }
};

const markFeeAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.schoolId;

    const query = { _id: id, schoolId };
    if (req.user.role === 'student') {
      query.studentId = req.user._id; // Ensure student can only pay their own fee
    }

    const fee = await FeeRecord.findOne(query);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found or access denied' });
    }

    fee.status = 'paid';
    fee.transactionId = `TXN_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    fee.paidAt = new Date();
    await fee.save();

    // Emit System Log
    await createLog(req.schoolId, 'Fee Collected', `$${fee.amount} collected for ${fee.title}`, 'success');

    res.json({ message: 'Fee paid successfully', fee });
  } catch (error) {
    console.error('Error updating fee status:', error);
    res.status(500).json({ message: 'Server error while updating fee' });
  }
};

module.exports = { generateFee, getFees, markFeeAsPaid };
