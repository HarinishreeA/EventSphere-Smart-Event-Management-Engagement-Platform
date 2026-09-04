const Event = require('../models/Event');
const RSVP = require('../models/RSVP');

// @desc    Get paginated events with optional filters & search
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const rawPage = parseInt(req.query.page, 10);
    const page = (!rawPage || rawPage < 1) ? 1 : rawPage;

    const rawLimit = parseInt(req.query.limit, 10);
    const limit = (!rawLimit || rawLimit < 1) ? 6 : rawLimit;

    const skip = (page - 1) * limit;

    const { category, search, status, startDate, endDate } = req.query;

    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { organizer: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const total = await Event.countDocuments(query);
    const pages = Math.ceil(total / limit) || 1;

    const events = await Event.find(query)
      .populate('createdBy', 'name email department')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      events,
      page,
      pages,
      total,
      limit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email department');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res, next) => {
  try {
    const { title, description, category, date, time, location, organizer, capacity } = req.body;

    if (!title || !description || !date || !time || !location || !organizer || !capacity) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    const event = await Event.create({
      title,
      description,
      category: category || 'Other',
      date,
      time,
      location,
      organizer,
      capacity: Number(capacity),
      imageUrl,
      createdBy: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const { title, description, category, date, time, location, organizer, capacity, status } = req.body;

    if (title) event.title = title;
    if (description) event.description = description;
    if (category) event.category = category;
    if (date) event.date = date;
    if (time) event.time = time;
    if (location) event.location = location;
    if (organizer) event.organizer = organizer;
    if (capacity) event.capacity = Number(capacity);
    if (status) event.status = status;

    if (req.file) {
      event.imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl !== undefined) {
      event.imageUrl = req.body.imageUrl;
    }

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Remove event and all related RSVPs
    await RSVP.deleteMany({ event: event._id });
    await event.deleteOne();

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
