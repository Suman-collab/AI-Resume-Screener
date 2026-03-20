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
const { protect, registeredUsersOnly } = require('../middleware/authMiddleware');

router.post('/apply/:jobId', protect, registeredUsersOnly, upload.single('resume'), applyToJob);
router.post('/analyze-resume', protect, registeredUsersOnly, analyzeResume);
router.post('/analyze-direct', protect, upload.single('resume'), analyzeResumeDirect);
router.post('/assistant', protect, registeredUsersOnly, assistantChat);
router.get('/applications', protect, registeredUsersOnly, getUserApplications);
router.get('/applications/:id', protect, registeredUsersOnly, getUserApplicationById);

module.exports = router;
