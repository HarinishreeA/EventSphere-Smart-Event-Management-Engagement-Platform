const express = require('express');
const router = express.Router();
const { getMyRSVPs, getMyEventPass, getMyHistory } = require('../controllers/rsvp.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.get('/my-events', protect, authorize('student'), getMyRSVPs);
router.get('/my-history', protect, getMyHistory);
router.get('/:eventId/my-pass', protect, getMyEventPass);

module.exports = router;

