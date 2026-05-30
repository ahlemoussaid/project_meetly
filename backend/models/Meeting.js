const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  duration: {
    type: String,
    required: true,
  },
  audioFileUrl: {
    type: String,
  },
  transcript: {
    type: mongoose.Schema.Types.Mixed,
    default: "Transcript processing placeholder...",
  },
  summary: {
    type: String,
    default: "AI Summary processing placeholder...",
  },
  status: {
    type: String,
    enum: ['pending', 'diarization', 'transcribing', 'summarizing', 'completed', 'failed'],
    default: 'pending',
  },
  error: {
    type: String,
    default: null,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);
