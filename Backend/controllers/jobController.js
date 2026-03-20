const Job = require('../models/Job');
const Application = require('../models/Application');
const axios = require('axios');
const { normalizeRequiredSkills, normalizeJobSkills } = require('../utils/skillNormalizer');

const parseTextToArray = (text) => {
  if (!text || typeof text !== 'string') return [];

  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);

  return lines
    .map((line) =>
      line
        .replace(/^\d+[\.\)]\s*/, '') // Remove numbering like "1. " or "1) "
        .replace(/^[-*•]\s*/, '') // Remove bullet points
        .replace(/^#+\s+/, '') // Remove markdown headers
        .trim()
    )
    .filter(Boolean)
    .slice(0, 5); // Limit to 5 items
};

const enrichRAGResponse = (data) => {
  if (!data) return data;

  return {
    ...data,
    strengths: parseTextToArray(data.skill_requirements || ''),
    weaknesses: parseTextToArray(data.weaknesses_and_suggestions || ''),
  };
};

const attachApplicantCounts = async (jobs) => {
  if (!jobs.length) {
    return [];
  }

  const jobIds = jobs.map((job) => job._id);
  const applicantCounts = await Application.aggregate([
    { $match: { jobId: { $in: jobIds } } },
    { $group: { _id: '$jobId', count: { $sum: 1 } } },
  ]);

  const countMap = new Map(
    applicantCounts.map((entry) => [String(entry._id), entry.count])
  );

  return jobs.map((job) => ({
    ...job,
    applicantCount: countMap.get(String(job._id)) || 0,
  }));
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private/HR
const createJob = async (req, res) => {
  try {
    const { title, description, company, requiredSkills } = req.body;

    const job = new Job({
      title,
      description,
      company,
      requiredSkills: normalizeRequiredSkills(requiredSkills),
      createdBy: req.user._id,
    });

    const createdJob = await job.save();
    res.status(201).json(createdJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public (or semi-public)
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({}).populate('createdBy', 'name').lean();
    res.json(jobs.map(normalizeJobSkills));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single job
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('createdBy', 'name').lean();

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(normalizeJobSkills(job));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get HR dashboard summary
// @route   GET /api/jobs/hr/overview
// @access  Private/HR
const getHRDashboard = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const jobsWithCounts = (await attachApplicantCounts(jobs)).map(normalizeJobSkills);
    const jobIds = jobs.map((job) => job._id);

    const totalApplicants = jobIds.length
      ? await Application.countDocuments({ jobId: { $in: jobIds } })
      : 0;

    res.json({
      stats: {
        activeJobs: jobs.length,
        totalApplicants,
      },
      recentJobs: jobsWithCounts.slice(0, 4),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get jobs created by the current HR
// @route   GET /api/jobs/hr/list
// @access  Private/HR
const getHRJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const jobsWithCounts = (await attachApplicantCounts(jobs)).map(normalizeJobSkills);
    res.json(jobsWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get applicants for a job
// @route   GET /api/jobs/:id/applicants
// @access  Private/HR
const getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, createdBy: req.user._id }).lean();

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const applications = await Application.find({ jobId: req.params.id })
      .populate('userId', 'name email')
      .sort({ ranking: -1, createdAt: -1 });

    res.json({
      job: normalizeJobSkills(job),
      applicants: applications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Analyze resumes for a job
// @route   POST /api/jobs/:id/analyze-resumes
// @access  Private/HR
const analyzeResumes = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Get all applications for this job that might need analysis
    const applications = await Application.find({ jobId: job._id });

    // In a real scenario, this could be a background job, but we'll await it here for simplicity
    const analyzedApps = [];

    for (const app of applications) {
      // Assuming app.resume contains the raw text for the RAG API, 
      // or at least enough info to send.
      try {
        const baseOrFullUrl = process.env.RAG_API_URL || 'http://127.0.0.1:8000/analyze_resume';
        const targetUrl = baseOrFullUrl.includes('/analyze_resume') 
          ? baseOrFullUrl 
          : `${baseOrFullUrl.replace(/\/$/, '')}/analyze_resume`;

        const response = await axios.post(targetUrl, {
          resume: app.resume,
          job_description: job.description
        });

        const data = enrichRAGResponse(response.data);

        // Output from RAG needs to map to these fields
        // ATS score, Strengths, Weaknesses, Required Tech Stack
        app.atsScore = data.ats_score || data.atsScore || 0;
        app.strengths = data.strengths || [];
        app.weaknesses = data.weaknesses || [];
        app.techStack = data.required_tech_stack || data.techStack || [];
        app.ranking = app.atsScore; // Set ranking to ATS score for simple sort
        if (app.status === 'pending') {
          app.status = 'reviewed';
        }

        await app.save();
        analyzedApps.push(app);
      } catch (err) {
        console.error(`Error analyzing application ${app._id}:`, err.message);
      }
    }

    res.json({ message: 'Resumes analyzed', count: analyzedApps.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  getHRDashboard,
  getHRJobs,
  getJobApplicants,
  analyzeResumes
};
