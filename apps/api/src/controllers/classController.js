const Class = require('../models/Class');
const Section = require('../models/Section');

const createClass = async (req, res) => {
  try {
    const { name, stream, academicYear } = req.body;
    
    // req.schoolId is injected by the auth middleware
    const schoolId = req.schoolId;

    const newClass = new Class({
      schoolId,
      name,
      stream,
      academicYear
    });

    await newClass.save();

    // Auto-create a default section "A" to streamline MVP onboarding
    const defaultSection = new Section({
      schoolId,
      classId: newClass._id,
      name: 'A'
    });
    await defaultSection.save();

    res.status(201).json(newClass);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Class name already exists for this academic year.' });
    }
    console.error('Error creating class:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getClasses = async (req, res) => {
  try {
    const { academicYear } = req.query;
    const query = { schoolId: req.schoolId };
    
    if (academicYear) {
      query.academicYear = academicYear;
    }

    const classes = await Class.find(query).sort({ name: 1 });
    res.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createSection = async (req, res) => {
  try {
    const { classId } = req.params;
    const { name } = req.body;
    const schoolId = req.schoolId;

    // Verify the class belongs to this school
    const classExists = await Class.findOne({ _id: classId, schoolId });
    if (!classExists) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const newSection = new Section({
      schoolId,
      classId,
      name
    });

    await newSection.save();
    res.status(201).json(newSection);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Section name already exists for this class.' });
    }
    console.error('Error creating section:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSections = async (req, res) => {
  try {
    const { classId } = req.params;
    
    // We filter by both classId and schoolId to prevent ID guessing
    let sections = await Section.find({ classId, schoolId: req.schoolId }).sort({ name: 1 });
    
    if (sections.length === 0) {
      // Self-heal: Create a default section 'A' if none exist
      const defaultSection = new Section({
        schoolId: req.schoolId,
        classId,
        name: 'A'
      });
      await defaultSection.save();
      sections = [defaultSection];
    }

    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createClass, getClasses, createSection, getSections };
