const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const os = require('os');
// Use disk storage — compatible with multer v1 and v2
const upload = multer({ dest: os.tmpdir() });

const {
  applyToJob,
  analyzeResume,
  analyzeResumeDirect,
  assistantChat,
  getUserApplications,
  getUserApplicationById
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/apply/:jobId', protect, upload.single('resume'), applyToJob);
router.post('/analyze-resume', protect, analyzeResume);
router.post('/analyze-direct', protect, upload.single('resume'), analyzeResumeDirect);
router.post('/assistant', protect, assistantChat);
router.get('/applications', protect, getUserApplications);
router.get('/applications/:id', protect, getUserApplicationById);

module.exports = router;
