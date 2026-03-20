const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
  getHRDashboard,
  getHRJobs,
  getJobApplicants,
  analyzeResumes
} = require('../controllers/jobController');
const { protect, hrOnly } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, hrOnly, createJob)
  .get(getJobs);

router.get('/hr/overview', protect, hrOnly, getHRDashboard);
router.get('/hr/list', protect, hrOnly, getHRJobs);

router.route('/:id/applicants')
  .get(protect, hrOnly, getJobApplicants);

router.route('/:id/analyze-resumes')
  .post(protect, hrOnly, analyzeResumes);

router.route('/:id')
  .get(getJobById);

module.exports = router;
