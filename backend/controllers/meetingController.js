const Meeting = require('../models/Meeting');

const createMeeting = async (req, res, next) => {
  try {
    const { title, duration, audioFileUrl } = req.body;

    const meeting = await Meeting.create({
      title,
      duration,
      audioFileUrl,
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};

const getMeetings = async (req, res, next) => {
  try {
    const meetings = await Meeting.find({ userId: req.user._id }).sort('-createdAt');
    res.json({
      success: true,
      data: meetings
    });
  } catch (error) {
    next(error);
  }
};

const getMeetingById = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting || meeting.userId.toString() !== req.user._id.toString()) {
      res.status(404);
      throw new Error('Meeting not found');
    }

    res.json({
      success: true,
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};

const deleteMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting || meeting.userId.toString() !== req.user._id.toString()) {
      res.status(404);
      throw new Error('Meeting not found');
    }

    await meeting.deleteOne();
    
    res.json({
      success: true,
      data: { message: 'Meeting removed' }
    });
  } catch (error) {
    next(error);
  }
};

const updateMeetingSummary = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting || meeting.userId.toString() !== req.user._id.toString()) {
      res.status(404);
      throw new Error('Meeting not found');
    }

    meeting.summary = req.body.summary || meeting.summary;
    meeting.transcript = req.body.transcript || meeting.transcript;

    const updatedMeeting = await meeting.save();
    
    res.json({
      success: true,
      data: updatedMeeting
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMeeting,
  getMeetings,
  getMeetingById,
  deleteMeeting,
  updateMeetingSummary
};
