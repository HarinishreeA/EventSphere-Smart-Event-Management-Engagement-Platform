const express = require('express');
const router = express.Router();
const { getMyRSVPs } = require('../controllers/rsvp.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.get('/my-events', protect, authorize('student'), getMyRSVPs);

module.exports = router;
