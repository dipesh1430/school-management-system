const TimetableDraft = require('../models/TimetableDraft');
const Timetable = require('../models/Timetable');
const TimetableStatus = require('../models/TimetableStatus');
const Class = require('../models/Class');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const TeacherProfile = require('../models/TeacherProfile');
const SubjectGroup = require('../models/SubjectGroup');
const mongoose = require('mongoose');

// Phase 2: Build Section Slot Plan
function buildSectionSlotPlan(section, subjects, subjectGroups) {
  let requiredSubjects = [];
  if (section.classId.level >= 11) {
    const group = subjectGroups.find(
      g => g.classId.equals(section.classId._id) && g.stream === section.classId.stream
    );
    if (group) {
      requiredSubjects = subjects.filter(s => 
        group.compulsorySubjectIds.includes(s._id) || 
        group.electiveSubjectIds.includes(s._id)
      );
    }
  } else {
    requiredSubjects = subjects.filter(s => s.classId.equals(section.classId._id));
  }

  const slots = [];
  for (const subject of requiredSubjects) {
    const periodsNeeded = subject.periodsPerWeek || 5; 
    const isDouble = subject.isPractical || false; 

    if (isDouble) {
      const blocks = Math.ceil(periodsNeeded / 2);
      for (let i = 0; i < blocks; i++) {
        slots.push({ subjectId: subject._id, isDouble: true, periodsConsumed: 2 });
      }
    } else {
      for (let i = 0; i < periodsNeeded; i++) {
        slots.push({ subjectId: subject._id, isDouble: false, periodsConsumed: 1 });
      }
    }
  }
  
  // Sort double periods first
  slots.sort((a, b) => b.periodsConsumed - a.periodsConsumed);
  return slots;
}

// Helper: Distribute across 6 days
function distributeAcrossWeek(slotPlan) {
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekPlan = new Map();
  DAYS.forEach(d => weekPlan.set(d, []));
  
  let dayIdx = 0;
  for (const slot of slotPlan) {
    weekPlan.get(DAYS[dayIdx]).push(slot);
    dayIdx = (dayIdx + 1) % DAYS.length;
  }
  return weekPlan;
}

// Phase 6: Score and Pick Teacher
function scoreAndPick(eligibleTeachers, day, teacherWeekCount, teacherDayCount, section) {
  const scored = eligibleTeachers.map(teacher => {
    const tId = teacher._id.toString();
    let score = 100;

    const avgWeekLoad = 30;
    if (teacherWeekCount[tId] < avgWeekLoad) score += 15;
    if (teacherDayCount[tId][day] <= 2) score += 20;
    else if (teacherDayCount[tId][day] === 3) score += 10;
    else if (teacherDayCount[tId][day] >= 4) score -= 30;

    if (section.classTeacherId && teacher._id.equals(section.classTeacherId)) score += 25;
    if (section.classId.stream && teacher.streamSpecialization === section.classId.stream) score += 15;

    if (teacherWeekCount[tId] >= 30) score -= 20;
    if (teacherWeekCount[tId] >= 33) score -= 40;

    return { teacher, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topScore = scored[0].score;
  const topCandidates = scored.filter(s => s.score === topScore);
  return topCandidates[Math.floor(Math.random() * topCandidates.length)].teacher;
}

function sortSectionsByDifficulty(sections) {
  return sections.sort((a, b) => {
    const levelDiff = (b.classId.level || 0) - (a.classId.level || 0);
    if (levelDiff !== 0) return levelDiff;

    const streamOrder = { Science: 3, Commerce: 2, Arts: 1, null: 0, undefined: 0 };
    const streamDiff = (streamOrder[b.classId.stream] || 0) - (streamOrder[a.classId.stream] || 0);
    if (streamDiff !== 0) return streamDiff;

    if (a.shift === 'Morning' && b.shift !== 'Morning') return -1;
    return 0;
  });
}

// Main Algorithm Loop
async function assignTimetable(data) {
  const teacherBusy = {};
  const teacherDayCount = {};
  const teacherWeekCount = {};
  
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  data.teachers.forEach(t => {
    const id = t._id.toString();
    teacherBusy[id] = { Monday:new Set(), Tuesday:new Set(), Wednesday:new Set(), Thursday:new Set(), Friday:new Set(), Saturday:new Set() };
    teacherDayCount[id] = { Monday:0, Tuesday:0, Wednesday:0, Thursday:0, Friday:0, Saturday:0 };
    teacherWeekCount[id] = 0;
  });

  const timetableSlots = []; 
  const conflicts = []; 

  const sortedSections = sortSectionsByDifficulty(data.sections);

  for (const section of sortedSections) {
    const sectionId = section._id.toString();
    const sectionShift = section.shift || 'Morning'; 

    const slotPlan = buildSectionSlotPlan(section, data.subjects, data.subjectGroups);
    const weekPlan = distributeAcrossWeek(slotPlan);

    for (const [day, daySlots] of weekPlan.entries()) {
      let periodCursor = 1; 

      for (const slot of daySlots) {
        if (periodCursor === 5) periodCursor++; // Skip lunch

        if (slot.isDouble && periodCursor >= 7) {
          conflicts.push({ sectionId, day, subjectId: slot.subjectId, reason: 'No room for double period' });
          continue;
        }

        const eligible = data.teachers.filter(teacher => {
          const tId = teacher._id.toString();
          return (
            teacher.subjectIds.some(s => s.equals(slot.subjectId)) &&
            !teacherBusy[tId][day].has(periodCursor) &&
            teacherWeekCount[tId] < 35 &&
            teacherDayCount[tId][day] < 5 &&
            (!section.shift || teacher.assignedShift === sectionShift)
          );
        });

        if (eligible.length === 0) {
          conflicts.push({
            sectionId,
            sectionName: `${section.classId.name} ${section.classId.stream || ''} Sec ${section.name}`,
            day,
            period: periodCursor,
            subjectId: slot.subjectId,
            reason: 'No eligible teacher available'
          });
          periodCursor += slot.periodsConsumed;
          continue;
        }

        const best = scoreAndPick(eligible, day, teacherWeekCount, teacherDayCount, section);
        const bId = best._id.toString();
        
        teacherBusy[bId][day].add(periodCursor);
        if (slot.isDouble) teacherBusy[bId][day].add(periodCursor + 1);
        teacherWeekCount[bId] += slot.periodsConsumed;
        teacherDayCount[bId][day] += slot.periodsConsumed;

        timetableSlots.push({
          schoolId: section.schoolId,
          sectionId: section._id,
          classId: section.classId._id,
          subjectId: slot.subjectId,
          teacherId: best._id,
          dayOfWeek: day,
          periodNumber: periodCursor,
          isDouble: slot.isDouble,
          endPeriod: slot.isDouble ? periodCursor + 1 : periodCursor
        });

        periodCursor += slot.periodsConsumed;
      }
    }
  }

  return { timetableSlots, conflicts };
}

exports.runTimetableAlgorithm = async (reqData) => {
  const { schoolId } = reqData;
  console.log(`[Worker] Starting CBSE Compliant Auto-Generation for school: ${schoolId}`);
  
  const [allTeachers, allSections, subjects, subjectGroups] = await Promise.all([
    TeacherProfile.find({ schoolId, isActive: true }).select('userId subjectIds assignedClasses designation assignedShift streamSpecialization'),
    Section.find({ schoolId }).populate('classId'),
    Subject.find({ schoolId }),
    SubjectGroup.find({ schoolId })
  ]);

  const mainSections = allSections.filter(s => s.stageType !== 'Foundational');
  const mainTeachers = allTeachers.filter(t => t.designation !== 'NTT');

  const data = {
    sections: mainSections,
    teachers: mainTeachers,
    subjects,
    subjectGroups
  };

  const { timetableSlots, conflicts } = await assignTimetable(data);

  // Group slots into the schema structure:
  // We need to convert timetableSlots into an array of { schoolId, classId, sectionId, schedule: [{ dayOfWeek, periods: [] }] }
  const scheduleMap = new Map();
  timetableSlots.forEach(slot => {
    const key = `${slot.classId}_${slot.sectionId}`;
    if (!scheduleMap.has(key)) {
      scheduleMap.set(key, {
        schoolId: slot.schoolId,
        classId: slot.classId,
        sectionId: slot.sectionId,
        scheduleMap: new Map()
      });
    }
    const secObj = scheduleMap.get(key);
    if (!secObj.scheduleMap.has(slot.dayOfWeek)) secObj.scheduleMap.set(slot.dayOfWeek, []);
    
    // Find subject name
    const subj = subjects.find(s => s._id.equals(slot.subjectId));
    
    secObj.scheduleMap.get(slot.dayOfWeek).push({
      periodNumber: slot.periodNumber,
      subject: subj ? subj.name : 'Unknown',
      teacherId: slot.teacherId,
      startTime: "00:00", // Will be filled dynamically by frontend/shift rules
      endTime: "00:00"
    });
  });

  const formattedDrafts = [];
  scheduleMap.forEach(secObj => {
    const schedule = [];
    secObj.scheduleMap.forEach((periods, dayOfWeek) => {
      schedule.push({ dayOfWeek, periods });
    });
    formattedDrafts.push({
      schoolId: secObj.schoolId,
      classId: secObj.classId,
      sectionId: secObj.sectionId,
      schedule,
      status: 'draft',
      conflicts: conflicts.filter(c => c.sectionId === secObj.sectionId.toString())
    });
  });

  // Save drafts
  const draftIds = [];
  for (const draft of formattedDrafts) {
    const created = await TimetableDraft.create(draft);
    draftIds.push(created._id);
  }

  // Update Status
  await TimetableStatus.findOneAndUpdate(
    { schoolId },
    { status: 'draft', lastGeneratedAt: new Date(), conflictCount: conflicts.length },
    { upsert: true }
  );

  return draftIds[0]; // Return the first one for the legacy controller fallback
};
