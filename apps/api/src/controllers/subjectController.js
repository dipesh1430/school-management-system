const Subject = require('../models/Subject');

const getSubjects = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const { stage } = req.query;

    const filter = { schoolId };
    if (stage) {
      filter.stage = stage;
    }

    const subjects = await Subject.find(filter).sort({ category: 1, name: 1 });
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Server error while fetching subjects' });
  }
};

module.exports = { getSubjects };
