const Notice = require('../models/Notice');
const Event = require('../models/Event');
const ical = require('ical-generator').default;

// Notices
const createNotice = async (req, res) => {
  try {
    const { title, body, audience, targetClassIds, attachments } = req.body;
    const schoolId = req.schoolId;
    const createdBy = req.user._id;

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }

    const newNotice = new Notice({
      schoolId,
      title,
      body,
      audience,
      targetClassIds: targetClassIds || [],
      attachments: attachments || [],
      createdBy
    });

    await newNotice.save();
    res.status(201).json({ message: 'Notice created', notice: newNotice });
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getNotices = async (req, res) => {
  try {
    // Basic implementation: fetch all notices for the school.
    // In a full implementation, you'd filter by req.user.role and the user's specific class if audience='specific_class'
    const notices = await Notice.find({ schoolId: req.schoolId }).sort({ createdAt: -1 });
    res.status(200).json(notices);
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findOneAndDelete({ _id: id, schoolId: req.schoolId });
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.status(200).json({ message: 'Notice deleted' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Events (Calendar)
const createEvent = async (req, res) => {
  try {
    const { title, type, startDate, endDate, description, targetClassIds } = req.body;
    const schoolId = req.schoolId;
    const createdBy = req.user._id;

    if (!title || !type || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required event fields' });
    }

    const newEvent = new Event({
      schoolId,
      title,
      type,
      startDate,
      endDate,
      description,
      targetClassIds: targetClassIds || [],
      createdBy
    });

    await newEvent.save();
    res.status(201).json({ message: 'Event created', event: newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ schoolId: req.schoolId }).sort({ startDate: 1 });
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findOneAndDelete({ _id: id, schoolId: req.schoolId });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json({ message: 'Event deleted' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const exportEventsIcs = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const events = await Event.find({ schoolId }).sort({ startDate: 1 });
    
    const calendar = ical({ name: 'School Academic Calendar' });
    
    events.forEach(event => {
      calendar.createEvent({
        start: event.startDate,
        end: event.endDate,
        summary: `[${event.type.toUpperCase()}] ${event.title}`,
        description: event.description || '',
        allDay: true
      });
    });

    calendar.serve(res);
  } catch (error) {
    console.error('Error exporting calendar:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createNotice, getNotices, deleteNotice, createEvent, getEvents, deleteEvent, exportEventsIcs };
