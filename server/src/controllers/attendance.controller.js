const RSVP = require('../models/RSVP');
const Event = require('../models/Event');
const User = require('../models/User');
const { notifyAttendanceCheckin } = require('../socket/socket');

const awardBadges = async (userId) => {
  try {
    const attendedCount = await RSVP.countDocuments({ user: userId, checkedIn: true, status: 'confirmed' });
    let newBadge = null;
    
    if (attendedCount === 1) newBadge = 'First Step';
    else if (attendedCount === 5) newBadge = 'Regular';
    else if (attendedCount === 10) newBadge = 'Campus Star';
    
    if (newBadge) {
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { badges: newBadge } }
      );
    }
  } catch (err) {
    console.error('Badge update failed:', err.message);
  }
};

// @desc    Validate ticket & record attendance check-in
// @route   POST /api/attendance/check-in
// @access  Private/Admin
const checkInTicket = async (req, res, next) => {
  try {
    const { ticketCode, eventId } = req.body;

    if (!ticketCode || !eventId) {
      return res.status(400).json({
        message: 'Both ticketCode and eventId are required for check-in validation',
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Lookup RSVP by ticketCode to inspect details
    const existingRSVP = await RSVP.findOne({
      ticketCode: ticketCode.trim().toUpperCase(),
    }).populate('user', 'name email department studentId');

    if (!existingRSVP) {
      return res.status(404).json({
        message: 'Invalid ticket code. No registration pass found.',
      });
    }

    // Verify ticket belongs to the specified event
    if (existingRSVP.event.toString() !== eventId.toString()) {
      return res.status(400).json({
        message: 'Ticket belongs to a different event. Entry denied for this venue.',
        wrongEvent: true,
      });
    }

    // Verify status is confirmed (waitlisted / cancelled passes reject)
    if (existingRSVP.status !== 'confirmed') {
      return res.status(400).json({
        message: `Pass is currently ${existingRSVP.status}. Only confirmed registrations are valid for check-in.`,
        status: existingRSVP.status,
      });
    }

    // Check for duplicate check-in
    if (existingRSVP.checkedIn) {
      return res.status(409).json({
        message: `Duplicate check-in detected! Pass was already checked in at ${new Date(existingRSVP.checkedInAt).toLocaleTimeString()} on ${new Date(existingRSVP.checkedInAt).toLocaleDateString()}.`,
        alreadyCheckedIn: true,
        attendee: existingRSVP.user,
        checkedInAt: existingRSVP.checkedInAt,
        checkInMethod: existingRSVP.checkInMethod,
      });
    }

    // Atomic update to avoid race conditions on duplicate scans
    const updatedRSVP = await RSVP.findOneAndUpdate(
      {
        _id: existingRSVP._id,
        checkedIn: false,
        status: 'confirmed',
      },
      {
        $set: {
          checkedIn: true,
          checkedInAt: new Date(),
          checkedInBy: req.user._id,
          checkInMethod: 'qr_scan',
        },
      },
      { new: true }
    ).populate('user', 'name email department studentId');

    if (!updatedRSVP) {
      return res.status(409).json({
        message: 'Duplicate check-in detected during concurrent processing.',
        alreadyCheckedIn: true,
      });
    }

    // Award 10 points to the student for QR check-in
    try {
      await User.findByIdAndUpdate(
        updatedRSVP.user._id,
        { $inc: { points: 10 } },
        { new: true }
      );
    } catch (pointsErr) {
      console.error('Points award failed (QR check-in):', pointsErr.message);
    }

    // Evaluate badges
    await awardBadges(updatedRSVP.user._id);

    // Fetch live stats for broadcast
    const totalConfirmed = await RSVP.countDocuments({ event: eventId, status: 'confirmed' });
    const totalCheckedIn = await RSVP.countDocuments({ event: eventId, status: 'confirmed', checkedIn: true });

    // Emit live Socket.IO update
    notifyAttendanceCheckin(eventId, {
      eventId,
      rsvpId: updatedRSVP._id,
      attendeeName: updatedRSVP.user ? updatedRSVP.user.name : 'Attendee',
      checkedInAt: updatedRSVP.checkedInAt,
      totalCheckedIn,
      totalConfirmed,
    });

    res.json({
      success: true,
      message: 'Attendance recorded successfully!',
      attendee: updatedRSVP.user,
      checkedInAt: updatedRSVP.checkedInAt,
      ticketCode: updatedRSVP.ticketCode,
      totalCheckedIn,
      totalConfirmed,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get live check-in statistics for an event
// @route   GET /api/attendance/event/:eventId/stats
// @access  Private/Admin
const getAttendanceStats = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const totalConfirmed = await RSVP.countDocuments({ event: eventId, status: 'confirmed' });
    const totalCheckedIn = await RSVP.countDocuments({ event: eventId, status: 'confirmed', checkedIn: true });
    const remaining = Math.max(0, totalConfirmed - totalCheckedIn);
    const percentage = totalConfirmed > 0 ? Math.round((totalCheckedIn / totalConfirmed) * 100) : 0;

    res.json({
      eventId,
      title: event.title,
      totalConfirmed,
      totalCheckedIn,
      remaining,
      percentage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually toggle attendance check-in status from roster
// @route   POST /api/attendance/manual-toggle
// @access  Private/Admin
const manualToggleAttendance = async (req, res, next) => {
  try {
    const { rsvpId, checkedIn } = req.body;

    if (!rsvpId) {
      return res.status(400).json({ message: 'rsvpId is required' });
    }

    const rsvp = await RSVP.findById(rsvpId).populate('user', 'name email department studentId');
    if (!rsvp) {
      return res.status(404).json({ message: 'RSVP record not found' });
    }

    if (rsvp.status !== 'confirmed') {
      return res.status(400).json({
        message: 'Only confirmed attendees can be marked as attended',
      });
    }

    const wasCheckedIn = rsvp.checkedIn;
    const shouldCheckIn = checkedIn !== undefined ? Boolean(checkedIn) : !rsvp.checkedIn;
    rsvp.checkedIn = shouldCheckIn;
    rsvp.checkedInAt = shouldCheckIn ? new Date() : null;
    rsvp.checkedInBy = shouldCheckIn ? req.user._id : null;
    rsvp.checkInMethod = shouldCheckIn ? 'manual_override' : null;
    await rsvp.save();

    // Award or revoke points based on transition
    if (shouldCheckIn && !wasCheckedIn && rsvp.user) {
      // Turning ON: award 10 points
      try {
        await User.findByIdAndUpdate(
          rsvp.user._id,
          { $inc: { points: 10 } },
          { new: true }
        );
      } catch (pointsErr) {
        console.error('Points award failed (manual toggle ON):', pointsErr.message);
      }
      
      // Evaluate badges
      await awardBadges(rsvp.user._id);
    } else if (!shouldCheckIn && wasCheckedIn && rsvp.user) {
      // Turning OFF: revoke 10 points, floor at 0
      try {
        const student = await User.findById(rsvp.user._id);
        if (student) {
          student.points = Math.max(0, student.points - 10);
          await student.save();
        }
      } catch (pointsErr) {
        console.error('Points revoke failed (manual toggle OFF):', pointsErr.message);
      }
    }

    const totalConfirmed = await RSVP.countDocuments({ event: rsvp.event, status: 'confirmed' });
    const totalCheckedIn = await RSVP.countDocuments({ event: rsvp.event, status: 'confirmed', checkedIn: true });

    notifyAttendanceCheckin(rsvp.event.toString(), {
      eventId: rsvp.event.toString(),
      rsvpId: rsvp._id,
      attendeeName: rsvp.user ? rsvp.user.name : 'Attendee',
      checkedInAt: rsvp.checkedInAt,
      totalCheckedIn,
      totalConfirmed,
    });

    res.json({
      success: true,
      message: shouldCheckIn ? 'Attendee marked as present' : 'Attendance check-in cleared',
      rsvp,
      totalCheckedIn,
      totalConfirmed,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkInTicket,
  getAttendanceStats,
  manualToggleAttendance,
};
