const express = require('express');
const router = express.Router();
const {
  createMeeting,
  getMeetings,
  getMeetingById,
  deleteMeeting,
  updateMeetingSummary
} = require('../controllers/meetingController');
const { protect } = require('../middlewares/auth');

router.route('/')
  .post(protect, createMeeting)
  .get(protect, getMeetings);

router.route('/:id')
  .get(protect, getMeetingById)
  .delete(protect, deleteMeeting)
  .patch(protect, updateMeetingSummary);

module.exports = router;
