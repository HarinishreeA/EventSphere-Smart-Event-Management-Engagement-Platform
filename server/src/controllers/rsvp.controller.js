const crypto = require('crypto');
const RSVP = require('../models/RSVP');
const Event = require('../models/Event');
const { notifyAttendeeUpdate } = require('../socket/socket');
const { sendRSVPConfirmationEmail, sendWaitlistEmail } = require('../services/email.service');

// Generate unique, clean, student-friendly ticket identifier
const generateTicketCode = (eventId) => {
  const eventPrefix = eventId.toString().slice(-4).toUpperCase();
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `ESP-${eventPrefix}-${randomHex}`;
};

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
      existingRSVP.checkedIn = false;
      existingRSVP.checkedInAt = null;
      existingRSVP.checkedInBy = null;
      existingRSVP.checkInMethod = null;
      existingRSVP.ticketCode = status === 'confirmed' ? generateTicketCode(eventId) : undefined;
      rsvp = await existingRSVP.save();
    } else {
      rsvp = await RSVP.create({
        user: userId,
        event: eventId,
        status,
        ticketCode: status === 'confirmed' ? generateTicketCode(eventId) : undefined,
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

    // Send email notification (non-blocking)
    if (status === 'confirmed') {
      sendRSVPConfirmationEmail(req.user, event, rsvp);
    } else if (status === 'waitlisted') {
      sendWaitlistEmail(req.user, event);
    }

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
        oldestWaitlist.ticketCode = generateTicketCode(eventId);
        await oldestWaitlist.save();

        event.attendeeCount += 1;
        event.waitlistCount = Math.max(0, event.waitlistCount - 1);
        promotedUser = oldestWaitlist.user;

        // Send promotion confirmation email with newly generated ticket code (non-blocking)
        sendRSVPConfirmationEmail(oldestWaitlist.user, event, oldestWaitlist);
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

// @desc    Get confirmed digital pass for logged in user for a specific event
// @route   GET /api/rsvp/:eventId/my-pass
// @access  Private (Student & Admin)
const getMyEventPass = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const rsvp = await RSVP.findOne({
      user: userId,
      event: eventId,
      status: 'confirmed',
    })
      .populate({
        path: 'event',
        populate: { path: 'createdBy', select: 'name email department' },
      })
      .populate('user', 'name email department studentId');

    if (!rsvp) {
      return res.status(404).json({
        message: 'No confirmed pass found for this event. You may be waitlisted or not registered.',
      });
    }

    res.json({
      pass: {
        rsvpId: rsvp._id,
        ticketCode: rsvp.ticketCode,
        checkedIn: rsvp.checkedIn,
        checkedInAt: rsvp.checkedInAt,
        registeredAt: rsvp.registeredAt,
        event: rsvp.event,
        user: rsvp.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance history for logged in user (only checkedIn: true, status: 'confirmed')
// @route   GET /api/rsvp/my-history
// @access  Private
const getMyHistory = async (req, res, next) => {
  try {
    const history = await RSVP.find({
      user: req.user._id,
      checkedIn: true,
      status: 'confirmed',
    })
      .populate({
        path: 'event',
        populate: { path: 'createdBy', select: 'name email department' },
      })
      .sort({ checkedInAt: -1 });

    res.json(history);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  rsvpToEvent,
  cancelRSVP,
  getMyRSVPs,
  getMyEventPass,
  getMyHistory,
};


