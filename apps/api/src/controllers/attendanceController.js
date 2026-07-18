const Attendance = require('../models/Attendance');

const markAttendance = async (req, res) => {
  try {
    const { classId, sectionId, date, records } = req.body;
    const schoolId = req.schoolId;

    // Validate inputs briefly (in production, use Zod schemas)
    if (!classId || !sectionId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'Invalid attendance payload' });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0); // Normalize to start of day

    // Upsert the attendance record for this class/section on this day
    const updatedAttendance = await Attendance.findOneAndUpdate(
      { schoolId, classId, sectionId, date: attendanceDate },
      { $set: { records } },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: 'Attendance marked successfully', data: updatedAttendance });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Server error while marking attendance' });
  }
};

const getAttendance = async (req, res) => {
  try {
    const { classId, sectionId, date } = req.query;
    const schoolId = req.schoolId;

    if (!classId || !sectionId || !date) {
      return res.status(400).json({ message: 'classId, sectionId, and date are required' });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ schoolId, classId, sectionId, date: attendanceDate })
      .populate('records.studentId', 'rollNo userId'); // We need userId for privacy lock matching

    if (!attendance) {
      return res.status(404).json({ message: 'No attendance record found for this date' });
    }

    // Privacy Lock: if student, ONLY send their own record back
    if (req.user.role === 'student') {
      const studentRecord = attendance.records.find(r => r.studentId.userId.toString() === req.user._id.toString());
      if (studentRecord) {
        return res.status(200).json({ ...attendance.toObject(), records: [studentRecord] });
      } else {
        return res.status(200).json({ ...attendance.toObject(), records: [] });
      }
    }

    res.status(200).json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Server error while fetching attendance' });
  }
};

module.exports = { markAttendance, getAttendance };
