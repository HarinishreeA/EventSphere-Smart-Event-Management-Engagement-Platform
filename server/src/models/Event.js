const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an event title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide an event description'],
  },
  category: {
    type: String,
    required: [true, 'Please select an event category'],
    enum: ['Fest', 'Workshop', 'Guest Lecture', 'Competition', 'Cultural', 'Sports', 'Other'],
    default: 'Other',
  },
  date: {
    type: Date,
    required: [true, 'Please provide an event date'],
  },
  time: {
    type: String,
    required: [true, 'Please provide an event time'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Please provide a location'],
    trim: true,
  },
  organizer: {
    type: String,
    required: [true, 'Please provide organizer name/department'],
    trim: true,
  },
  capacity: {
    type: Number,
    required: [true, 'Please specify maximum capacity'],
    min: [1, 'Capacity must be at least 1'],
  },
  attendeeCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  waitlistCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Virtual index for searching
eventSchema.index({ title: 'text', description: 'text', organizer: 'text', location: 'text' });

module.exports = mongoose.model('Event', eventSchema);
