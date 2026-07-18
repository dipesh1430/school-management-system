const School = require('../models/School');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { SchoolSchema } = require('@school-saas/shared-types'); // Using our Zod schema!

const createSchool = async (req, res) => {
  try {
    // Validate request body against Zod schema
    const validationResult = SchoolSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.format() 
      });
    }

    const { name, board, address, subscriptionPlan } = validationResult.data;

    const newSchool = new School({
      name,
      board,
      address,
      subscriptionPlan
    });

    await newSchool.save();

    // Auto-generate default school admin
    const adminEmail = `admin@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    const tempPassword = Math.random().toString(36).slice(-8); // Random 8 char password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newAdmin = new User({
      schoolId: newSchool._id,
      name: 'Default Admin',
      email: adminEmail,
      passwordHash: hashedPassword,
      role: 'admin',
      phone: '0000000000',
      isActive: true
    });
    
    await newAdmin.save();

    res.status(201).json({
      message: 'School created successfully',
      school: newSchool,
      adminCredentials: { email: adminEmail, password: tempPassword }
    });

  } catch (error) {
    console.error('Error creating school:', error);
    res.status(500).json({ message: 'Server error while creating school' });
  }
};

const getSchools = async (req, res) => {
  try {
    const schools = await School.find();
    res.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ message: 'Server error while fetching schools' });
  }
};

const getMySchool = async (req, res) => {
  try {
    const school = await School.findById(req.schoolId);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    res.json(school);
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({ message: 'Server error while fetching school' });
  }
};

const updateSchool = async (req, res) => {
  try {
    const updateFields = {
      name: req.body.name,
      board: req.body.board,
      address: req.body.address,
      logoUrl: req.body.logoUrl,
      cbseAffiliationNumber: req.body.cbseAffiliationNumber,
      schoolCode: req.body.schoolCode,
      udiseCode: req.body.udiseCode,
      affiliationStatus: req.body.affiliationStatus,
      affiliationPeriodFrom: req.body.affiliationPeriodFrom,
      affiliationPeriodTo: req.body.affiliationPeriodTo,
      currentAcademicYear: req.body.currentAcademicYear,
      workingDays: req.body.workingDays,
      shifts: req.body.shifts,
      timetableConstraints: req.body.timetableConstraints,
      gradingSchema: req.body.gradingSchema
    };
    
    // Remove undefined fields so we don't accidentally overwrite with nulls
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    const school = await School.findByIdAndUpdate(
      req.schoolId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    res.json({ message: 'School updated successfully', school });
  } catch (error) {
    console.error('Error updating school:', error);
    res.status(500).json({ message: 'Server error while updating school' });
  }
};

const updateSchoolStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, subscriptionPlan } = req.body;
    
    const updateFields = {};
    if (isActive !== undefined) updateFields.isActive = isActive;
    if (subscriptionPlan !== undefined) updateFields.subscriptionPlan = subscriptionPlan;

    const school = await School.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
    if (!school) return res.status(404).json({ message: 'School not found' });
    
    res.json({ message: 'School status updated', school });
  } catch (error) {
    console.error('Error updating school status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPlatformAnalytics = async (req, res) => {
  try {
    const totalSchools = await School.countDocuments();
    const activeSchools = await School.countDocuments({ isActive: true });
    
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);
    
    const usersMap = usersByRole.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.json({
      totalSchools,
      activeSchools,
      users: {
        total: (usersMap['admin'] || 0) + (usersMap['teacher'] || 0) + (usersMap['student'] || 0) + (usersMap['parent'] || 0),
        admins: usersMap['admin'] || 0,
        teachers: usersMap['teacher'] || 0,
        students: usersMap['student'] || 0,
        parents: usersMap['parent'] || 0
      }
    });
  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createSchool, getSchools, getMySchool, updateSchool, updateSchoolStatus, getPlatformAnalytics };
