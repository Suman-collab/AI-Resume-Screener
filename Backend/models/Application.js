const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  resume: {
    type: String, // Path to stored resume or text
    required: true
  },
  atsScore: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'accepted', 'rejected'],
    default: 'pending'
  },
  strengths: [{
    type: String
  }],
  weaknesses: [{
    type: String
  }],
  techStack: [{
    type: String
  }],
  ranking: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
