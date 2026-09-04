const express = require('express');
const router = express.Router();
const { getAdminStats, getEventAttendees } = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/events/:id/attendees', getEventAttendees);

module.exports = router;
