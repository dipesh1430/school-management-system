const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const TeacherProfile = require('../models/TeacherProfile');
const bcrypt = require('bcryptjs');
const { createLog } = require('./logController');

// Helper function to create the base User credentials
const createUserCredentials = async (schoolId, role, name, email, phone, password) => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = new User({
    schoolId,
    role,
    name,
    email,
    phone,
    passwordHash
  });

  return await newUser.save();
};

const createStudent = async (req, res) => {
  try {
    const { 
      name, email, phone, password, classId, sectionId, rollNo, admissionNo, dob, academicYear,
      gender, motherName, fatherName, guardianName, category, bloodGroup, cwsnStatus, aadhaarNumber, 
      apaarId, pen, subjectsChosen,
      hasTransferCertificate, hasMarkSheet, hasMigrationCertificate, hasBirthCertificate
    } = req.body;
    
    const schoolId = req.schoolId;

    // 1. Create Base User
    const newUser = await createUserCredentials(schoolId, 'student', name, email, phone, password);

    // 2. Create Student Profile
    try {
      const newProfile = new StudentProfile({
        schoolId,
        userId: newUser._id,
        classId,
        sectionId,
        rollNo,
        admissionNo,
        dob,
        academicYear,
        gender, motherName, fatherName, guardianName, category, bloodGroup, cwsnStatus, aadhaarNumber, 
        apaarId, pen, subjectsChosen,
        hasTransferCertificate, hasMarkSheet, hasMigrationCertificate, hasBirthCertificate
      });
      await newProfile.save();
      
      // Emit System Log
      await createLog(schoolId, 'Student Enrolled', `New student ${name} enrolled in Class ${classId}`, 'success');

      res.status(201).json({ message: 'Student created successfully', user: newUser, profile: newProfile });
    } catch (profileError) {
      // Rollback user if profile creation fails
      await User.findByIdAndDelete(newUser._id);
      throw profileError;
    }

  } catch (error) {
    console.error('Error creating student:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A student with this email or admission number already exists.' });
    }
    res.status(500).json({ message: 'Server error while creating student' });
  }
};

const createTeacher = async (req, res) => {
  try {
    const { 
      name, email, phone, password,
      fatherOrHusbandName, dob, aadhaarNumber, designation,
      academicQualifications, professionalQualifications, tetStatus, tetScore,
      dateOfAppointment, experienceYears
    } = req.body;
    
    const schoolId = req.schoolId;

    // 1. Create Base User
    const newUser = await createUserCredentials(schoolId, 'teacher', name, email, phone, password);

    // 2. Create Teacher Profile
    try {
      const newProfile = new TeacherProfile({
        schoolId,
        userId: newUser._id,
        assignedClasses: [],
        fatherOrHusbandName, dob, aadhaarNumber, designation,
        academicQualifications, professionalQualifications, tetStatus, tetScore,
        dateOfAppointment, experienceYears
      });
      await newProfile.save();
      
      // Emit System Log
      await createLog(schoolId, 'Teacher Onboarded', `New teacher ${name} (${designation}) joined the school`, 'success');

      res.status(201).json({ message: 'Teacher created successfully', user: newUser, profile: newProfile });
    } catch (profileError) {
      // Rollback user if profile creation fails
      await User.findByIdAndDelete(newUser._id);
      throw profileError;
    }

  } catch (error) {
    console.error('Error creating teacher:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }
    res.status(500).json({ message: 'Server error while creating teacher' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, staffDetails } = req.body;
    const schoolId = req.schoolId;

    if (!['principal', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role for this endpoint.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      schoolId,
      role,
      name,
      email,
      phone,
      passwordHash,
      staffDetails
    });

    await newUser.save();

    await createLog(schoolId, 'User Onboarded', `New ${role} ${name} joined the school`, 'success');

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }
    res.status(500).json({ message: 'Server error while creating user' });
  }
};

const getUsers = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    
    // Fetch all users for this school, excluding passwordHash
    const users = await User.find({ schoolId }).select('-passwordHash').sort({ role: 1, name: 1 }).lean();
    
    // Attach deep teacher details (designation, subjects, classes)
    const teacherProfiles = await TeacherProfile.find({ schoolId })
      .populate('subjectIds', 'name')
      .populate('assignedClasses.classId', 'name');

    const profileMap = {};
    teacherProfiles.forEach(p => {
      profileMap[p.userId.toString()] = {
        designation: p.designation || '',
        subjects: p.subjectIds?.map(s => s.name) || [],
        classes: p.assignedClasses?.map(ac => ac.classId?.name).filter(Boolean) || []
      };
    });

    const enrichedUsers = users.map(u => {
      if (u.role === 'teacher' && profileMap[u._id.toString()]) {
        u.teacherDetails = profileMap[u._id.toString()];
      }
      return u;
    });

    res.json(enrichedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

const getStudentRoster = async (req, res) => {
  try {
    const { classId, sectionId } = req.query;
    const schoolId = req.schoolId;

    if (!classId || !sectionId) {
      return res.status(400).json({ message: 'classId and sectionId are required' });
    }

    const students = await StudentProfile.find({ schoolId, classId, sectionId })
      .populate('userId', 'name email isActive')
      .sort({ rollNo: 1 });

    res.json(students);
  } catch (error) {
    console.error('Error fetching student roster:', error);
    res.status(500).json({ message: 'Server error while fetching roster' });
  }
};

const getStudentsByClass = async (req, res) => {
  try {
    const { classId } = req.query;
    const schoolId = req.schoolId;

    if (!classId) {
      return res.status(400).json({ message: 'classId is required' });
    }

    const students = await StudentProfile.find({ schoolId, classId })
      .populate('userId', 'name email profilePic isActive')
      .populate('sectionId', 'name')
      .sort({ sectionId: 1, rollNo: 1 });

    res.json(students);
  } catch (error) {
    console.error('Error fetching students by class:', error);
    res.status(500).json({ message: 'Server error while fetching students' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.schoolId;

    const user = await User.findOne({ _id: id, schoolId }).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ userId: id, schoolId })
        .populate('classId', 'name stream')
        .populate('sectionId', 'name');
    } else if (user.role === 'teacher') {
      profile = await TeacherProfile.findOne({ userId: id, schoolId })
        .populate('assignedClasses.classId', 'name')
        .populate('assignedClasses.sectionId', 'name')
        .populate('subjectIds', 'name');
    }

    res.json({ user, profile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error while fetching user profile' });
  }
};
module.exports = { createStudent, createTeacher, createUser, getUsers, getStudentRoster, getStudentsByClass, getUserProfile };
