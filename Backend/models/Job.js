const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  requiredSkills: [{
    type: String
  }],
  skillCategories: {
    programmingLanguages: [{
      type: String
    }],
    frameworksLibraries: [{
      type: String
    }],
    databases: [{
      type: String
    }],
    cloudDevOps: [{
      type: String
    }],
    toolsPlatforms: [{
      type: String
    }],
    methodologies: [{
      type: String
    }],
    softSkills: [{
      type: String
    }],
    otherSkills: [{
      type: String
    }]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
