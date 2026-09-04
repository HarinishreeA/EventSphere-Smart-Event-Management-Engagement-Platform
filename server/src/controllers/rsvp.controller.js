const RSVP = require('../models/RSVP');
const Event = require('../models/Event');
const { notifyAttendeeUpdate } = require('../socket/socket');

// @desc    RSVP to an event (handles capacity & automatic waitlisting)
// @route   POST /api/events/:id/rsvp
// @access  Private (Student & Admin)
const rsvpToEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot RSVP to a cancelled event' });
    }

    // Check if user already RSVP'd
    const existingRSVP = await RSVP.findOne({ user: userId, event: eventId });
    if (existingRSVP && existingRSVP.status !== 'cancelled') {
      return res.status(400).json({
        message: `You have already ${existingRSVP.status === 'confirmed' ? 'RSVP\'d to' : 'joined the waitlist for'} this event`,
        status: existingRSVP.status,
      });
    }

    let status = 'confirmed';
    if (event.attendeeCount >= event.capacity) {
      status = 'waitlisted';
    }

    let rsvp;
    if (existingRSVP) {
      existingRSVP.status = status;
      existingRSVP.registeredAt = new Date();
      rsvp = await existingRSVP.save();
    } else {
      rsvp = await RSVP.create({
        user: userId,
        event: eventId,
        status,
      });
    }

    // Update event counters
    if (status === 'confirmed') {
      event.attendeeCount += 1;
    } else {
      event.waitlistCount += 1;
    }
    await event.save();

    // Trigger real-time socket update
    notifyAttendeeUpdate(eventId, {
      eventId: event._id,
      attendeeCount: event.attendeeCount,
      waitlistCount: event.waitlistCount,
      capacity: event.capacity,
    });

    res.status(201).json({
      message: status === 'confirmed' ? 'RSVP confirmed successfully!' : 'Event capacity reached. You have been added to the waitlist!',
      rsvp,
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel RSVP (auto-promotes next waitlisted user if spot opens)
// @route   DELETE /api/events/:id/rsvp
// @access  Private (Student & Admin)
const cancelRSVP = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const rsvp = await RSVP.findOne({ user: userId, event: eventId });
    if (!rsvp || rsvp.status === 'cancelled') {
      return res.status(400).json({ message: 'You have not RSVP\'d to this event' });
    }

    const previousStatus = rsvp.status;
    await rsvp.deleteOne();

    let promotedUser = null;

    if (previousStatus === 'confirmed') {
      event.attendeeCount = Math.max(0, event.attendeeCount - 1);

      // Check if there's someone on the waitlist to promote!
      const oldestWaitlist = await RSVP.findOne({ event: eventId, status: 'waitlisted' })
        .sort({ registeredAt: 1 })
        .populate('user', 'name email');

      if (oldestWaitlist) {
        oldestWaitlist.status = 'confirmed';
        await oldestWaitlist.save();

        event.attendeeCount += 1;
        event.waitlistCount = Math.max(0, event.waitlistCount - 1);
        promotedUser = oldestWaitlist.user;
      }
    } else if (previousStatus === 'waitlisted') {
      event.waitlistCount = Math.max(0, event.waitlistCount - 1);
    }

    await event.save();

    // Trigger real-time socket update
    notifyAttendeeUpdate(eventId, {
      eventId: event._id,
      attendeeCount: event.attendeeCount,
      waitlistCount: event.waitlistCount,
      capacity: event.capacity,
    });

    res.json({
      message: 'RSVP cancelled successfully',
      promotedUser: promotedUser ? promotedUser.name : null,
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all RSVPs for the logged in user
// @route   GET /api/rsvp/my-events
// @access  Private
const getMyRSVPs = async (req, res, next) => {
  try {
    const rsvps = await RSVP.find({ user: req.user._id, status: { $ne: 'cancelled' } })
      .populate({
        path: 'event',
        populate: { path: 'createdBy', select: 'name email department' },
      })
      .sort({ registeredAt: -1 });

    res.json(rsvps);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  rsvpToEvent,
  cancelRSVP,
  getMyRSVPs,
};
