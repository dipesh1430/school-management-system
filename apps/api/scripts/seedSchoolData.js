const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Models
const School = require('../src/models/School');
const Class = require('../src/models/Class');
const Section = require('../src/models/Section');
const User = require('../src/models/User');
const TeacherProfile = require('../src/models/TeacherProfile');
const SubjectGroup = require('../src/models/SubjectGroup');
const Subject = require('../src/models/Subject');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school-saas';

const runSeeder = async () => {
  let schoolIdArg = process.argv[2];

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to Database');

    let school;
    if (schoolIdArg) {
      school = await School.findById(schoolIdArg);
    } else {
      console.log('⚠️ No schoolId provided. Finding the first available school...');
      school = await School.findOne();
    }

    if (!school) {
      console.error('❌ School not found in database. Please register a school first.');
      process.exit(1);
    }
    console.log(`🏫 Seeding data for: ${school.name} (ID: ${school._id})`);

    // 1. CLEAR EXISTING DATA FOR THIS SCHOOL (Safe Seeding)
    console.log('🧹 Clearing existing Classes, Sections, Subjects, and Subject Groups...');
    
    // Using drop() to ensure old conflicting indexes are wiped out
    try { await mongoose.connection.db.collection('classes').drop(); } catch(e) {}
    try { await mongoose.connection.db.collection('sections').drop(); } catch(e) {}
    try { await mongoose.connection.db.collection('subjectgroups').drop(); } catch(e) {}
    try { await mongoose.connection.db.collection('subjects').drop(); } catch(e) {}
    try { await mongoose.connection.db.collection('studentprofiles').drop(); } catch(e) {}
    try { await mongoose.connection.db.collection('teacherprofiles').drop(); } catch(e) {}
    try { await mongoose.connection.db.collection('feerecords').drop(); } catch(e) {}
    try { await mongoose.connection.db.collection('attendances').drop(); } catch(e) {}
    
    // Clear Users
    await User.deleteMany({ schoolId: school._id, role: { $in: ['teacher', 'student'] } });

    // 2. SEED CLASSES & SECTIONS
    console.log('⏳ Seeding Classes & Sections...');
    const classesToCreate = [
      { name: 'Nursery', level: 'pre-primary', stage: 'foundational', shift: 'noon', gradingType: 'holistic' },
      { name: 'Jr. KG', level: 'pre-primary', stage: 'foundational', shift: 'noon', gradingType: 'holistic' },
      { name: 'Sr. KG', level: 'pre-primary', stage: 'foundational', shift: 'noon', gradingType: 'holistic' },
      { name: '1st', level: 'primary', stage: 'foundational', shift: 'noon', gradingType: 'holistic' },
      { name: '2nd', level: 'primary', stage: 'foundational', shift: 'noon', gradingType: 'holistic' },
      { name: '3rd', level: 'primary', stage: 'preparatory', shift: 'noon', gradingType: 'marks' },
      { name: '4th', level: 'primary', stage: 'preparatory', shift: 'noon', gradingType: 'marks' },
      { name: '5th', level: 'primary', stage: 'preparatory', shift: 'noon', gradingType: 'marks' },
      { name: '6th', level: 'middle', stage: 'middle', shift: 'morning', gradingType: 'marks' },
      { name: '7th', level: 'middle', stage: 'middle', shift: 'morning', gradingType: 'marks' },
      { name: '8th', level: 'middle', stage: 'middle', shift: 'morning', gradingType: 'marks' },
      { name: '9th', level: 'secondary', stage: 'secondary', shift: 'morning', gradingType: 'marks' },
      { name: '10th', level: 'secondary', stage: 'secondary', shift: 'morning', gradingType: 'marks' },
      { name: '11th', level: 'higher-secondary', stream: 'Science', stage: 'secondary', shift: 'morning', gradingType: 'marks' },
      { name: '11th', level: 'higher-secondary', stream: 'Commerce', stage: 'secondary', shift: 'morning', gradingType: 'marks' },
      { name: '11th', level: 'higher-secondary', stream: 'Arts', stage: 'secondary', shift: 'morning', gradingType: 'marks' },
      { name: '12th', level: 'higher-secondary', stream: 'Science', stage: 'secondary', shift: 'morning', gradingType: 'marks' },
      { name: '12th', level: 'higher-secondary', stream: 'Commerce', stage: 'secondary', shift: 'morning', gradingType: 'marks' },
      { name: '12th', level: 'higher-secondary', stream: 'Arts', stage: 'secondary', shift: 'morning', gradingType: 'marks' },
    ];

    const classDocs = await Class.insertMany(
      classesToCreate.map(c => ({ schoolId: school._id, academicYear: '2026-2027', ...c }))
    );

    // 2. SEED CBSE SUBJECTS
    console.log('⏳ Seeding CBSE Subjects...');
    const subjectsToCreate = [
      // Foundational
      { name: 'English', stage: 'foundational', category: 'core' },
      { name: 'Hindi', stage: 'foundational', category: 'core' },
      { name: 'Mathematics', stage: 'foundational', category: 'core' },
      { name: 'Environmental Studies (EVS)', stage: 'foundational', category: 'core' },
      { name: 'Art & Craft', stage: 'foundational', category: 'co-scholastic' },
      
      // Preparatory
      { name: 'English', stage: 'preparatory', category: 'core' },
      { name: 'Hindi', stage: 'preparatory', category: 'core' },
      { name: 'Mathematics', stage: 'preparatory', category: 'core' },
      { name: 'Environmental Studies (EVS)', stage: 'preparatory', category: 'core' },
      { name: 'Computer Science', stage: 'preparatory', category: 'minor' },
      { name: 'Art Education', stage: 'preparatory', category: 'co-scholastic' },
      { name: 'Physical Education', stage: 'preparatory', category: 'co-scholastic' },
      
      // Middle
      { name: 'English', stage: 'middle', category: 'core' },
      { name: 'Hindi', stage: 'middle', category: 'core' },
      { name: 'Mathematics', stage: 'middle', category: 'core' },
      { name: 'Science', stage: 'middle', category: 'core' },
      { name: 'Social Science', stage: 'middle', category: 'core' },
      { name: 'Sanskrit (3rd Language)', stage: 'middle', category: 'core' },
      { name: 'Computer Science', stage: 'middle', category: 'minor' },
      { name: 'Art Education', stage: 'middle', category: 'co-scholastic' },
      { name: 'Physical Education', stage: 'middle', category: 'co-scholastic' },
      
      // Secondary
      { name: 'English Language & Literature', stage: 'secondary', category: 'core', code: '184' },
      { name: 'Hindi Course A', stage: 'secondary', category: 'core', code: '002' },
      { name: 'Mathematics Standard', stage: 'secondary', category: 'core', code: '041' },
      { name: 'Science', stage: 'secondary', category: 'core', code: '086' },
      { name: 'Social Science', stage: 'secondary', category: 'core', code: '087' },
      { name: 'Information Technology', stage: 'secondary', category: 'skill', code: '402' },
      
      // Senior Secondary
      { name: 'English Core', stage: 'senior-secondary', category: 'core', code: '301' },
      { name: 'Physics', stage: 'senior-secondary', category: 'major', code: '042' },
      { name: 'Chemistry', stage: 'senior-secondary', category: 'major', code: '043' },
      { name: 'Mathematics', stage: 'senior-secondary', category: 'elective', code: '041' },
      { name: 'Biology', stage: 'senior-secondary', category: 'elective', code: '044' },
      { name: 'Computer Science', stage: 'senior-secondary', category: 'minor', code: '083' },
      { name: 'Physical Education', stage: 'senior-secondary', category: 'minor', code: '048' },
      { name: 'Accountancy', stage: 'senior-secondary', category: 'major', code: '055' },
      { name: 'Business Studies', stage: 'senior-secondary', category: 'major', code: '054' },
      { name: 'Economics', stage: 'senior-secondary', category: 'major', code: '030' },
      { name: 'Applied Mathematics', stage: 'senior-secondary', category: 'elective', code: '241' },
      { name: 'Informatics Practices', stage: 'senior-secondary', category: 'minor', code: '065' },
      { name: 'History', stage: 'senior-secondary', category: 'major', code: '027' },
      { name: 'Political Science', stage: 'senior-secondary', category: 'major', code: '028' },
      { name: 'Geography', stage: 'senior-secondary', category: 'major', code: '029' },
      { name: 'Sociology', stage: 'senior-secondary', category: 'elective', code: '039' },
      { name: 'Psychology', stage: 'senior-secondary', category: 'elective', code: '037' }
    ];

    await Subject.insertMany(
      subjectsToCreate.map(s => ({ schoolId: school._id, ...s }))
    );
    console.log(`✅ Seeded ${subjectsToCreate.length} CBSE subjects.`);

    // 3. SEED SECTIONS & SUBJECT GROUPS
    console.log('⏳ Seeding Sections & Subject Groups...');
    const sectionsToCreate = [];
    const subjectGroupsToCreate = [];

    for (const classDoc of classDocs) {
      sectionsToCreate.push({ schoolId: school._id, classId: classDoc._id, name: 'A', roomNumber: `${classDoc.name}-101` });
      sectionsToCreate.push({ schoolId: school._id, classId: classDoc._id, name: 'B', roomNumber: `${classDoc.name}-102` });
      
      // Seed Subject Groups for 11th and 12th
      if (classDoc.stream === 'Science') {
        subjectGroupsToCreate.push({
          schoolId: school._id,
          classId: classDoc._id,
          stream: 'Science',
          mandatorySubjects: ['English Core', 'Physics', 'Chemistry'],
          electiveOptions: ['Mathematics', 'Biology', 'Computer Science', 'Physical Education'],
          minimumTotalSubjects: 5
        });
      } else if (classDoc.stream === 'Commerce') {
        subjectGroupsToCreate.push({
          schoolId: school._id,
          classId: classDoc._id,
          stream: 'Commerce',
          mandatorySubjects: ['English Core', 'Accountancy', 'Business Studies', 'Economics'],
          electiveOptions: ['Mathematics', 'Applied Mathematics', 'Physical Education', 'Informatics Practices'],
          minimumTotalSubjects: 5
        });
      } else if (classDoc.stream === 'Arts') {
        subjectGroupsToCreate.push({
          schoolId: school._id,
          classId: classDoc._id,
          stream: 'Arts',
          mandatorySubjects: ['English Core', 'History', 'Political Science', 'Geography'],
          electiveOptions: ['Sociology', 'Psychology', 'Physical Education', 'Applied Mathematics'],
          minimumTotalSubjects: 5
        });
      }
    }
    await Section.insertMany(sectionsToCreate);
    if (subjectGroupsToCreate.length > 0) {
      await SubjectGroup.insertMany(subjectGroupsToCreate);
    }
    console.log(`✅ Seeded ${classDocs.length} classes, ${sectionsToCreate.length} sections, and Subject Groups.`);

    // 2. SEED TEACHERS
    console.log('⏳ Seeding Teachers...');
    const teacherData = require('./teacherSeedData');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('teacher123', salt);

    // Fetch all classes, sections, and subjects for matching
    const allSections = await Section.find({ schoolId: school._id }).populate('classId');
    const allSubjects = await Subject.find({ schoolId: school._id });

    let teacherCount = 0;
    for (const t of teacherData) {
      const user = new User({
        schoolId: school._id,
        role: 'teacher',
        name: t.name,
        email: t.email,
        phone: t.phone,
        passwordHash,
        isActive: true
      });
      await user.save();

      // Find subjects
      const subjectIds = [];
      for (const rawSub of t.subjectsTaughtRaw) {
        const foundSub = allSubjects.find(s => s.name === rawSub);
        if (foundSub) subjectIds.push(foundSub._id);
      }

      // Find assigned classes and sections
      const assignedClasses = [];
      
      if (t.assignedClassesRaw === 'ALL') {
         // Assign to all sections
         for (const sec of allSections) {
            assignedClasses.push({ classId: sec.classId._id, sectionId: sec._id });
         }
      } else {
        for (const rawClass of t.assignedClassesRaw) {
          // Find matching sections for this rawClass.
          // e.g., rawClass = '11th', streamRaw could be 'Science' or ['Science', 'Commerce']
          const matchingSections = allSections.filter(sec => {
            const cName = sec.classId.name;
            const cStream = sec.classId.stream;
            
            if (cName !== rawClass) return false;
            
            if (t.streamRaw === 'All') return true;
            if (Array.isArray(t.streamRaw) && cStream) {
               return t.streamRaw.includes(cStream);
            }
            if (t.streamRaw && cStream) {
               return t.streamRaw === cStream;
            }
            return true;
          });

          for (const mSec of matchingSections) {
             assignedClasses.push({ classId: mSec.classId._id, sectionId: mSec._id });
          }
        }
      }

      const profile = new TeacherProfile({
        schoolId: school._id,
        userId: user._id,
        gender: t.gender,
        designation: t.designation,
        teacherCode: t.teacherCode,
        assignedClasses,
        subjectIds,
        dob: new Date(t.dob),
        dateOfAppointment: new Date(t.joiningDate),
        experienceYears: Math.floor(Math.random() * 15) + 1,
        academicQualifications: 'M.A / M.Sc / B.Ed',
        professionalQualifications: 'CBSE Certified',
        trainingHours: t.trainingHours
      });
      await profile.save();
      teacherCount++;
    }
    
    console.log(`✅ Seeded ${teacherCount} highly qualified CBSE teachers. (Password: teacher123)`);
    
    console.log('🎉 Data Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

runSeeder();
