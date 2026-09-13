const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { deleteFromCloudinary } = require('../middleware/upload');

// GET /api/events
const getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'upcoming' } = req.query;
    const query = {};
    if (status !== 'all') query.status = status;

    const events = await Event.find(query)
      .populate('organizer', 'username fullName avatar')
      .populate('community', 'name slug')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Attach attendance status
    let result = events.map(e => e.toObject());
    if (req.user) {
      result = result.map(e => ({
        ...e,
        isAttending: e.attendees.some(a => a.toString() === req.user._id.toString()),
      }));
    }

    const total = await Event.countDocuments(query);
    res.json({ success: true, events: result, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/events/:id
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'username fullName avatar')
      .populate('community', 'name slug')
      .populate('attendees', 'username fullName avatar');

    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    const isAttending = req.user ? event.attendees.some(a => a._id.toString() === req.user._id.toString()) : false;

    res.json({ success: true, event: { ...event.toObject(), isAttending } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/events
const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, community, maxAttendees, tags } = req.body;

    const eventData = {
      organizer: req.user._id,
      title, description, date, time, location,
      community: community || null,
      maxAttendees: maxAttendees || 0,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      attendees: [req.user._id],
      attendeesCount: 1,
    };

    if (req.file) {
      eventData.image = req.file.path;
      eventData.imagePublicId = req.file.filename;
    }

    const event = await Event.create(eventData);
    const populated = await Event.findById(event._id).populate('organizer', 'username fullName avatar');

    res.status(201).json({ success: true, event: { ...populated.toObject(), isAttending: true } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/events/:id/attend
const attendEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    const alreadyAttending = event.attendees.includes(req.user._id);
    if (alreadyAttending) {
      // Leave event
      event.attendees = event.attendees.filter(a => a.toString() !== req.user._id.toString());
      event.attendeesCount = Math.max(0, event.attendeesCount - 1);
      await event.save();
      return res.json({ success: true, isAttending: false, attendeesCount: event.attendeesCount });
    }

    // Check max capacity
    if (event.maxAttendees > 0 && event.attendeesCount >= event.maxAttendees) {
      return res.status(400).json({ success: false, message: 'Event is at full capacity.' });
    }

    event.attendees.push(req.user._id);
    event.attendeesCount += 1;
    await event.save();

    res.json({ success: true, isAttending: true, attendeesCount: event.attendeesCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (event.imagePublicId) await deleteFromCloudinary(event.imagePublicId);
    await event.deleteOne();

    res.json({ success: true, message: 'Event deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getEvents, getEvent, createEvent, attendEvent, deleteEvent };
