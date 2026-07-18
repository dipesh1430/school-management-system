const LeaveRequest = require('../models/LeaveRequest');
const { createLog } = require('./logController');
const User = require('../models/User');

const applyLeave = async (req, res) => {
  try {
    const { fromDate, toDate, reason } = req.body;
    const schoolId = req.schoolId;
    const userId = req.user._id;

    if (!fromDate || !toDate || !reason) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const leaveRequest = new LeaveRequest({
      schoolId,
      userId,
      fromDate,
      toDate,
      reason
    });

    await leaveRequest.save();

    res.status(201).json({ message: 'Leave application submitted', data: leaveRequest });
  } catch (error) {
    console.error('Error applying for leave:', error);
    res.status(500).json({ message: 'Server error while applying for leave' });
  }
};

const getLeaves = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    
    let query = { schoolId };
    
    // Privacy lock: standard staff/students can only see their own requests
    if (['teacher', 'student', 'parent'].includes(req.user.role)) {
      query.userId = req.user._id;
    }

    const leaves = await LeaveRequest.find(query)
      .populate('userId', 'name email role')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(leaves);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ message: 'Server error while fetching leaves' });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const schoolId = req.schoolId;
    const reviewerId = req.user._id;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const leaveRequest = await LeaveRequest.findOne({ _id: id, schoolId }).populate('userId', 'name role');
    
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leaveRequest.status = status;
    leaveRequest.reviewedBy = reviewerId;
    leaveRequest.reviewedAt = new Date();
    
    await leaveRequest.save();

    await createLog(req.schoolId, `Leave ${status}`, `${leaveRequest.userId.name} (${leaveRequest.userId.role}) leave request was ${status.toLowerCase()}`, status === 'Approved' ? 'success' : 'warning');

    res.status(200).json({ message: `Leave request ${status.toLowerCase()} successfully`, data: leaveRequest });
  } catch (error) {
    console.error('Error updating leave status:', error);
    res.status(500).json({ message: 'Server error while updating leave status' });
  }
};

module.exports = { applyLeave, getLeaves, updateLeaveStatus };
