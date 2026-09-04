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
  registeredAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Ensure a user can only have one active RSVP record per event
rsvpSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('RSVP', rsvpSchema);
