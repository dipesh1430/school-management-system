const Timetable = require('../models/Timetable');
const LunchMenu = require('../models/LunchMenu');
const SystemLog = require('../models/SystemLog');
const TimetableDraft = require('../models/TimetableDraft');
const Substitution = require('../models/Substitution');
const TimetableStatus = require('../models/TimetableStatus');
const { runTimetableAlgorithm } = require('../workers/timetableWorker');
const crypto = require('crypto');

const mockJobs = new Map();
// Timetable Operations
exports.getTimetable = async (req, res) => {
  try {
    const { classId, sectionId } = req.params;
    const timetables = await Timetable.find({ schoolId: req.schoolId, classId, sectionId }).populate('periods.teacherId', 'name');
    res.json(timetables);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.saveTimetable = async (req, res) => {
  try {
    const { classId, sectionId, dayOfWeek, periods } = req.body;
    let timetable = await Timetable.findOne({ schoolId: req.schoolId, classId, sectionId, dayOfWeek });
    
    if (timetable) {
      timetable.periods = periods;
      await timetable.save();
    } else {
      timetable = new Timetable({
        schoolId: req.schoolId,
        classId,
        sectionId,
        dayOfWeek,
        periods
      });
      await timetable.save();
    }
    
    await SystemLog.create({
      schoolId: req.schoolId,
      actorId: req.user.id || req.user.userId,
      actorName: req.user.name || 'System',
      action: 'Updated Timetable',
      message: `Updated timetable for ${dayOfWeek}`,
      targetResource: `Timetable for ${dayOfWeek}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json(timetable);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// Lunch Menu Operations
exports.getLunchMenus = async (req, res) => {
  try {
    const { classId, sectionId } = req.params;
    if (!classId || !sectionId) return res.status(400).json({ message: 'classId and sectionId are required' });
    
    const menus = await LunchMenu.find({ schoolId: req.schoolId, classId, sectionId }).sort({ dayOfWeek: 1 });
    res.json(menus);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.saveLunchMenu = async (req, res) => {
  try {
    const { classId, sectionId, dayOfWeek, foodItems, rules } = req.body;
    if (!classId || !sectionId) return res.status(400).json({ message: 'classId and sectionId are required' });

    let menu = await LunchMenu.findOne({ schoolId: req.schoolId, classId, sectionId, dayOfWeek });
    
    if (menu) {
      menu.foodItems = foodItems;
      menu.rules = rules;
      await menu.save();
    } else {
      menu = new LunchMenu({
        schoolId: req.schoolId,
        classId,
        sectionId,
        dayOfWeek,
        foodItems,
        rules
      });
      await menu.save();
    }
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Background Generation Operations
exports.triggerTimetableGeneration = async (req, res) => {
  try {
    const { classId, sectionId, shift } = req.body;
    const schoolId = req.schoolId;

    const jobId = crypto.randomUUID();
    mockJobs.set(jobId, { status: 'processing', draftId: null });

    // Fire and forget (mocking background worker without Redis)
    setTimeout(async () => {
      try {
        const draftId = await runTimetableAlgorithm({ classId, sectionId, shift, schoolId });
        mockJobs.set(jobId, { status: 'completed', draftId });
      } catch (err) {
        console.error('Mock worker failed:', err);
        mockJobs.set(jobId, { status: 'failed', draftId: null });
      }
    }, 0);

    return res.status(202).json({
      success: true,
      status: 'processing',
      jobId: jobId,
      message: 'Algorithm started in the background.'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.checkJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = mockJobs.get(jobId);
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    if (job.status === 'completed') {
      return res.status(200).json({
        success: true,
        status: 'completed',
        draftId: job.draftId
      });
    }
    
    return res.status(200).json({ success: true, status: job.status });
  } catch (error) {
    console.error('checkJobStatus Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getDraft = async (req, res) => {
  try {
    const { draftId } = req.params;
    const draft = await TimetableDraft.findById(draftId).populate('schedule.periods.teacherId', 'name');
    res.json(draft);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Substitutions
exports.getSubstitutions = async (req, res) => {
  try {
    const { date, classId, sectionId } = req.query;
    if (!date || !classId || !sectionId) {
      return res.status(400).json({ message: 'date, classId, and sectionId are required' });
    }
    const substitutions = await Substitution.find({ schoolId: req.schoolId, date, classId, sectionId })
      .populate('originalTeacherId', 'name')
      .populate('substituteTeacherId', 'name');
    res.json(substitutions);
  } catch (err) {
    console.error('Error fetching substitutions:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.saveSubstitution = async (req, res) => {
  try {
    const { date, classId, sectionId, periodNumber, originalTeacherId, substituteTeacherId } = req.body;
    
    if (!date || !classId || !sectionId || !periodNumber || !substituteTeacherId) {
      return res.status(400).json({ message: 'Missing required substitution fields' });
    }

    let substitution = await Substitution.findOne({ schoolId: req.schoolId, date, classId, sectionId, periodNumber });
    
    if (substitution) {
      substitution.substituteTeacherId = substituteTeacherId;
      substitution.originalTeacherId = originalTeacherId;
      await substitution.save();
    } else {
      substitution = new Substitution({
        schoolId: req.schoolId,
        date,
        classId,
        sectionId,
        periodNumber,
        originalTeacherId,
        substituteTeacherId
      });
      await substitution.save();
    }
    
    res.status(201).json(substitution);
  } catch (err) {
    console.error('Error saving substitution:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Approval & States Workflow
exports.getTimetableStatus = async (req, res) => {
  try {
    const { classId, sectionId } = req.params;
    let statusDoc = await TimetableStatus.findOne({ schoolId: req.schoolId, classId, sectionId });
    if (!statusDoc) {
      statusDoc = await TimetableStatus.create({ schoolId: req.schoolId, classId, sectionId, status: 'draft' });
    }
    res.json(statusDoc);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateTimetableStatus = async (req, res) => {
  try {
    const { classId, sectionId } = req.params;
    const { status, remarks } = req.body;
    
    // Only superadmin can approve/reject
    if (['published', 'rejected'].includes(status) && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmins can approve or reject timetables.' });
    }

    const statusDoc = await TimetableStatus.findOneAndUpdate(
      { schoolId: req.schoolId, classId, sectionId },
      { status, remarks: remarks || '' },
      { new: true, upsert: true }
    );
    
    res.json(statusDoc);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.revokeTimetable = async (req, res) => {
  try {
    const { classId, sectionId } = req.params;
    
    // Nuclear option: delete all timetable records for this class/section
    await Timetable.deleteMany({ schoolId: req.schoolId, classId, sectionId });
    
    // Reset status to draft
    const statusDoc = await TimetableStatus.findOneAndUpdate(
      { schoolId: req.schoolId, classId, sectionId },
      { status: 'draft', remarks: 'Master timetable was revoked and cleared by Superadmin.' },
      { new: true, upsert: true }
    );
    
    res.json({ message: 'Timetable revoked successfully', statusDoc });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
