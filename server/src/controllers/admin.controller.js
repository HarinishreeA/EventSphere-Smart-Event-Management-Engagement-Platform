const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const User = require('../models/User');

// @desc    Get Admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({ status: 'upcoming' });
    const totalRSVPs = await RSVP.countDocuments({ status: 'confirmed' });
    const totalWaitlist = await RSVP.countDocuments({ status: 'waitlisted' });
    const totalStudents = await User.countDocuments({ role: 'student' });

    res.json({
      totalEvents,
      upcomingEvents,
      totalRSVPs,
      totalWaitlist,
      totalStudents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendee list for a specific event
// @route   GET /api/admin/events/:id/attendees
// @access  Private/Admin
const getEventAttendees = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const attendees = await RSVP.find({ event: req.params.id })
      .populate('user', 'name email department studentId')
      .sort({ registeredAt: 1 });

    const confirmed = attendees.filter(a => a.status === 'confirmed');
    const waitlisted = attendees.filter(a => a.status === 'waitlisted');

    res.json({
      event: {
        _id: event._id,
        title: event.title,
        capacity: event.capacity,
        attendeeCount: event.attendeeCount,
        waitlistCount: event.waitlistCount,
      },
      totalCount: attendees.length,
      confirmed,
      waitlisted,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getEventAttendees,
};
