const express = require('express');
const router = express.Router();
const {
  checkInTicket,
  getAttendanceStats,
  manualToggleAttendance,
} = require('../controllers/attendance.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// All attendance routes require authentication & admin role
router.use(protect);
router.use(authorize('admin'));

router.post('/check-in', checkInTicket);
router.get('/event/:eventId/stats', getAttendanceStats);
router.post('/manual-toggle', manualToggleAttendance);

module.exports = router;
