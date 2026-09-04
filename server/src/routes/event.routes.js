const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/event.controller');
const { rsvpToEvent, cancelRSVP } = require('../controllers/rsvp.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// RSVP routes (Student only)
router.post('/:id/rsvp', protect, authorize('student'), rsvpToEvent);
router.delete('/:id/rsvp', protect, authorize('student'), cancelRSVP);

// Admin-only routes
router.post('/', protect, authorize('admin'), upload.single('image'), createEvent);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateEvent);
router.delete('/:id', protect, authorize('admin'), deleteEvent);

module.exports = router;
