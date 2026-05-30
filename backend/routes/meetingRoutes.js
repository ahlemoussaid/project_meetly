const express = require('express');
const router = express.Router();
const {
  createMeeting,
  getMeetings,
  getMeetingById,
  deleteMeeting,
  updateMeetingSummary,
  processMeeting
} = require('../controllers/meetingController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.route('/')
  .post(protect, createMeeting)
  .get(protect, getMeetings);

router.post('/process-meeting', protect, upload.single('audio'), processMeeting);

router.route('/:id')
  .get(protect, getMeetingById)
  .delete(protect, deleteMeeting)
  .patch(protect, updateMeetingSummary);

module.exports = router;
