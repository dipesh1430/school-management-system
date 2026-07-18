const PTMSchedule = require('../models/PTMSchedule');
const { createLog } = require('./logController');

exports.createSchedule = async (req, res) => {
  try {
    const { classId, date, meetingProvider, meetingLink, slots } = req.body;
    
    // Validate slots format
    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: 'Please provide valid time slots.' });
    }

    const schedule = new PTMSchedule({
      schoolId: req.schoolId,
      classId,
      teacherId: req.user._id,
      date,
      meetingProvider,
      meetingLink,
      slots: slots.map(time => ({ time, status: 'Available' }))
    });

    await schedule.save();
    
    await createLog(req.schoolId, 'PTM Schedule Created', `A new PTM schedule was created for ${date}`, 'success');

    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getSchedules = async (req, res) => {
  try {
    // Determine filter based on role
    const filter = { schoolId: req.schoolId };
    
    // Teachers only see their own schedules
    if (req.user.role === 'teacher') {
      filter.teacherId = req.user._id;
    }

    // Parents only see schedules for a specific class if requested
    if (req.query.classId) {
      filter.classId = req.query.classId;
    }

    const schedules = await PTMSchedule.find(filter)
      .populate('classId', 'name')
      .populate('teacherId', 'name profilePic')
      .populate('slots.parentId', 'name phone')
      .sort({ date: 1 });
      
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.bookSlot = async (req, res) => {
  try {
    const { scheduleId, slotId } = req.params;
    
    // Currently acting as parent
    const parentId = req.user._id;

    const schedule = await PTMSchedule.findOneAndUpdate(
      { 
        _id: scheduleId, 
        schoolId: req.schoolId,
        'slots._id': slotId,
        'slots.status': 'Available' 
      },
      { 
        $set: { 
          'slots.$.parentId': parentId,
          'slots.$.status': 'Booked'
        } 
      },
      { new: true }
    );

    if (!schedule) {
      return res.status(400).json({ message: 'Slot not available or already booked.' });
    }

    res.json(schedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
