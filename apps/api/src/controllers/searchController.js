const User = require('../models/User');
const Notice = require('../models/Notice');
const Class = require('../models/Class');

const search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const schoolId = req.schoolId;
    const regex = new RegExp(q, 'i');
    
    const results = [];

    // Search Users
    const users = await User.find({ schoolId, name: regex }).limit(5);
    users.forEach(u => results.push({ type: 'user', id: u._id, title: u.name, subtitle: u.role }));

    // Search Notices
    const notices = await Notice.find({ schoolId, title: regex }).limit(5);
    notices.forEach(n => results.push({ type: 'notice', id: n._id, title: n.title, subtitle: `Notice for ${n.audience}` }));

    // Search Classes
    const classes = await Class.find({ schoolId, name: regex }).limit(3);
    classes.forEach(c => results.push({ type: 'class', id: c._id, title: c.name, subtitle: `Class ${c.stream || ''}` }));

    res.json(results);
  } catch (error) {
    console.error('Error in search:', error);
    res.status(500).json({ message: 'Server error during search' });
  }
};

module.exports = { search };
