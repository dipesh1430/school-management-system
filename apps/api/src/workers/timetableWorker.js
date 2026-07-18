const TimetableDraft = require('../models/TimetableDraft');
const Timetable = require('../models/Timetable');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const TeacherProfile = require('../models/TeacherProfile');

exports.runTimetableAlgorithm = async (data) => {
  const { schoolId, classId, sectionId, shift } = data;
  console.log(`[Worker] Processing timetable generation for classId: ${classId}, sectionId: ${sectionId}`);

  // Simulate heavy CSP Backtracking calculation (NP-hard simulation)
  await new Promise((resolve) => setTimeout(resolve, 4000));

  // 1. Fetch Class and Subjects
  const classDoc = await Class.findById(classId);
  let subjects = await Subject.find({ schoolId, stage: classDoc.stage });

  // Apply strict CBSE stream-level validation to prevent cross-stream mapping (e.g. Science subjects in Arts)
  if (classDoc.stream) {
    const streamMap = {
      'Arts': ['History', 'Political Science', 'Geography', 'Economics', 'English', 'Hindi', 'Physical Education', 'Art'],
      'Science': ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science', 'English', 'Physical Education', 'Information Technology'],
      'Commerce': ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'English', 'Physical Education', 'Information Technology']
    };

    const allowedSubjects = streamMap[classDoc.stream] || [];
    if (allowedSubjects.length > 0) {
      subjects = subjects.filter(sub => 
        allowedSubjects.some(allowed => sub.name.toLowerCase().includes(allowed.toLowerCase()))
      );
    }
  }
  
  // 2. Fetch Eligible Teachers
  const teacherProfiles = await TeacherProfile.find({
    schoolId
  }).populate('subjectIds');

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const schedule = [];

  const addMinutes = (timeStr, mins) => {
    let [h, m] = timeStr.split(':').map(Number);
    let newM = m + mins;
    let newH = h + Math.floor(newM / 60);
    newM = newM % 60;
    return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
  };

  // 3. Setup Global Availability Matrix (Double Booking Prevention)
  const existingTimetables = await Timetable.find({ schoolId });
  const existingDrafts = await TimetableDraft.find({ schoolId, status: 'draft' });

  // teacherAvailability[day][period][teacherId] = boolean (true if locked)
  const teacherAvailability = {};
  DAYS.forEach(day => {
    teacherAvailability[day] = {};
    for (let i = 1; i <= 8; i++) {
      teacherAvailability[day][i] = {};
    }
  });

  const hydrateMatrix = (docList) => {
    docList.forEach(doc => {
      // Don't lock resources for the class we are currently generating (it might be a re-run)
      if (doc.classId.toString() === classId && doc.sectionId.toString() === sectionId) return;
      
      const schedules = doc.schedule ? doc.schedule : (doc.periods ? [{ dayOfWeek: doc.dayOfWeek, periods: doc.periods }] : []);
      schedules.forEach(daySched => {
        if (!teacherAvailability[daySched.dayOfWeek]) return;
        if (daySched.periods) {
          daySched.periods.forEach(p => {
            if (p.teacherId && teacherAvailability[daySched.dayOfWeek][p.periodNumber]) {
               teacherAvailability[daySched.dayOfWeek][p.periodNumber][p.teacherId.toString()] = true;
            }
          });
        }
      });
    });
  };

  hydrateMatrix(existingTimetables);
  hydrateMatrix(existingDrafts);

  // 4. Recursive CSP Algorithm with Backtracking
  const masterSchedule = [];
  
  // Pre-calculate time slots for all 8 periods based on shift
  const timeSlots = [];
  let currentHour = shift === 'noon' ? 13 : 7;
  let currentMinute = shift === 'noon' ? 30 : 30;
  let timeCursor = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
  
  for (let i = 1; i <= 8; i++) {
    if (i === 5) {
      timeCursor = addMinutes(timeCursor, 30); // 30 min break
    }
    const endTime = addMinutes(timeCursor, 40);
    timeSlots.push({ periodNumber: i, startTime: timeCursor, endTime: endTime });
    timeCursor = endTime;
  }

  // Find all teachers eligible for a specific subject
  const getEligibleTeachers = (subjectName) => {
    const cleanTargetSubj = subjectName.toLowerCase().replace('language & literature', '').trim();
    return teacherProfiles.filter(tp => {
      if (Array.isArray(tp.specializedSubjects) && tp.specializedSubjects.includes(subjectName)) return true;
      if (Array.isArray(tp.subjectIds)) return tp.subjectIds.some(s => s.name && s.name.toLowerCase().includes(cleanTargetSubj));
      return false;
    });
  };

  const backtrack = (dayIndex, periodIndex, currentDaySchedule) => {
    // Base Case 1: Successfully filled all days
    if (dayIndex >= DAYS.length) return true;

    // Base Case 2: Successfully filled all periods for the current day. Move to next day.
    if (periodIndex >= 8) {
      masterSchedule.push({ dayOfWeek: DAYS[dayIndex], periods: [...currentDaySchedule] });
      return backtrack(dayIndex + 1, 0, []);
    }

    const currentDay = DAYS[dayIndex];
    const periodNumber = periodIndex + 1;
    const slotTimes = timeSlots[periodIndex];
    
    // Prevent assigning the same subject too many times in one day
    const subjectCounts = {};
    currentDaySchedule.forEach(p => {
      subjectCounts[p.subject] = (subjectCounts[p.subject] || 0) + 1;
    });

    let availableSubjects = subjects.filter(s => (subjectCounts[s.name] || 0) < 2);
    if (availableSubjects.length === 0) availableSubjects = subjects; // fallback

    const requiredSubject = availableSubjects.length > 0 ? availableSubjects[Math.floor(Math.random() * availableSubjects.length)].name : '';
    
    // Shuffle candidates so the algorithm doesn't heavily bias the first teacher in the DB for every single period
    let candidates = getEligibleTeachers(requiredSubject).sort(() => Math.random() - 0.5);
    
    // Attempt to place a teacher
    for (const tp of candidates) {
      const tId = tp.userId.toString();
      
      // VALIDATION STEP: Check global matrix
      if (teacherAvailability[currentDay][periodNumber][tId]) {
         continue; // Reject placement, teacher is busy
      }

      // Teacher workload limit (don't give a teacher 8 periods in a row in the same class)
      const periodsAssignedToTeacher = currentDaySchedule.filter(p => p.teacherId && p.teacherId.toString() === tId).length;
      if (periodsAssignedToTeacher >= 2) {
         continue; // Reject placement, this teacher is already teaching this class enough today
      }

      // LOCK STEP:
      teacherAvailability[currentDay][periodNumber][tId] = true;
      
      currentDaySchedule.push({
         periodNumber: periodNumber,
         subject: requiredSubject,
         teacherId: tp.userId,
         startTime: slotTimes.startTime,
         endTime: slotTimes.endTime
      });

      // Recurse
      if (backtrack(dayIndex, periodIndex + 1, currentDaySchedule)) {
         return true; // Success path found
      }

      // BACKTRACK (UNLOCK) STEP: Dead end reached. Undo placement.
      delete teacherAvailability[currentDay][periodNumber][tId];
      currentDaySchedule.pop();
    }

    // If no candidate worked (or there were no candidates/subjects), we allow a NULL assignment so the algorithm doesn't completely fail
    currentDaySchedule.push({
         periodNumber: periodNumber,
         subject: requiredSubject,
         teacherId: null,
         startTime: slotTimes.startTime,
         endTime: slotTimes.endTime
    });
    
    if (backtrack(dayIndex, periodIndex + 1, currentDaySchedule)) {
         return true;
    }
    
    currentDaySchedule.pop();

    return false; // Total failure to find a valid arrangement
  };

  // Start the backtracking recursion
  backtrack(0, 0, []);

  // 5. Save to Drafts Collection
  const newDraft = await TimetableDraft.create({
    schoolId,
    classId,
    sectionId,
    schedule: masterSchedule,
    status: 'draft'
  });

  return newDraft._id;
};
