const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  status: {
    type: String,
    enum: ['confirmed', 'waitlisted', 'cancelled'],
    default: 'confirmed',
  },
  ticketCode: {
    type: String,
    trim: true,
    uppercase: true,
  },
  checkedIn: {
    type: Boolean,
    default: false,
  },
  checkedInAt: {
    type: Date,
    default: null,
  },
  checkedInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  checkInMethod: {
    type: String,
    enum: ['qr_scan', 'manual_override', null],
    default: null,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Ensure a user can only have one active RSVP record per event
rsvpSchema.index({ user: 1, event: 1 }, { unique: true });

// Unique sparse index for ticket verification
rsvpSchema.index({ ticketCode: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('RSVP', rsvpSchema);

