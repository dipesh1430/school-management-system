const SystemLog = require('../models/SystemLog');

const getLogs = async (req, res) => {
  try {
    const logs = await SystemLog.find({ schoolId: req.schoolId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Server error fetching logs' });
  }
};

const createLog = async (schoolId, action, message, type = 'info') => {
  try {
    const log = new SystemLog({ schoolId, action, message, type });
    await log.save();
  } catch (error) {
    console.error('Error creating system log:', error);
  }
};

module.exports = { getLogs, createLog };
