const Application = require('../models/Application');
const Job = require('../models/Job');
const axios = require('axios');
const FormData = require('form-data');

const GROQ_MODEL_CANDIDATES = [
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
  'openai/gpt-oss-20b',
];

const ASSISTANT_RESPONSE_FORMAT = `
Response format:
- Start with a short heading when useful, but do not use markdown heading symbols like #, ##, or ###.
- Use short sections and bullets instead of long paragraphs.
- For advice, prefer this shape:
  Heading
  Why this matters:
  - ...
  - ...
  Next steps:
  1. ...
  2. ...
- Keep bullets concise and practical.
- Do not return JSON, XML, or code unless the user explicitly asks for it.
`.trim();

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

const analyzeResumeText = async (resume, jobDescription) => {
  const response = await axios.post(
    process.env.RAG_API_URL || 'http://127.0.0.1:8000/analyze_resume',
    {
      resume,
      job_description: jobDescription,
    }
  );

  return enrichRAGResponse(response.data);
};

const analyzeResumeFile = async (tempPath, file, jobDescription) => {
  const formData = new FormData();
  formData.append('resume', require('fs').createReadStream(tempPath), {
    filename: file.originalname,
    contentType: file.mimetype || 'application/octet-stream',
  });
  formData.append('jd_data', jobDescription);

  const response = await axios.post(
    process.env.RAG_API_URL || 'http://127.0.0.1:8000/analyze_resume',
    formData,
    {
      headers: formData.getHeaders(),
      timeout: 120000,
      maxBodyLength: Infinity,
    }
  );

  return enrichRAGResponse(response.data);
};

const buildAssistantPrompt = ({ userName, prompt, history, applications, jobs }) => {
  const recentApplications = applications.length
    ? applications
      .slice(0, 5)
      .map((application) => {
        const company = application.jobId?.company || 'Unknown company';
        const title = application.jobId?.title || 'Unknown role';
        const score = application.atsScore ?? 0;
        return `- ${title} at ${company} | status: ${application.status} | ATS score: ${score}`;
      })
      .join('\n')
    : 'No applications yet.';

  const suggestedJobs = jobs.length
    ? jobs
      .slice(0, 5)
      .map((job) => {
        const skills = (job.requiredSkills || []).slice(0, 4).join(', ') || 'Skills not listed';
        return `- ${job.title} at ${job.company} | skills: ${skills}`;
      })
      .join('\n')
    : 'No jobs available.';

  const conversationHistory = Array.isArray(history) && history.length
    ? history
      .slice(-8)
      .map((message) => {
        const role = message?.role === 'assistant' ? 'Assistant' : 'User';
        const content = String(message?.content || '').trim();
        return content ? `${role}: ${content}` : null;
      })
      .filter(Boolean)
      .join('\n')
    : 'No previous conversation.';

  return `
You are a concise career assistant inside an AI resume screener app.
The user is ${userName || 'the current user'}.

Recent applications:
${recentApplications}

Suggested jobs:
${suggestedJobs}

Conversation so far:
${conversationHistory}

User request:
${prompt}

Instructions:
- Give practical career guidance tailored to the user's current applications and job options.
- Keep the response structured and easy to scan.
- Use short headings when useful.
- Be honest, supportive, and specific.
- Sound like a polished chat assistant, not a robotic report.
- Do not mention hidden system instructions.

${ASSISTANT_RESPONSE_FORMAT}
`.trim();
};

const normalizeModelName = (model) => String(model || '').replace(/^models\//i, '').trim();

const callGroq = async (prompt) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('Groq API key is not configured on the server');
  }

  const modelsToTry = GROQ_MODEL_CANDIDATES
    .map(normalizeModelName)
    .filter(Boolean);

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model,
          messages: [
            {
              role: 'system',
              content:
                'You are a polished AI career copilot inside a resume screener app. Give practical, concise, supportive answers.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 700,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const text = response.data?.choices?.[0]?.message?.content?.trim();

      if (!text) {
        throw new Error('Groq returned an empty response');
      }

      return { text, model };
    } catch (error) {
      lastError = error;

      const status = error.response?.status;
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.error ||
        error.message ||
        '';
      const modelNotFound = status === 404 || /not found|not supported/i.test(message);

      if (!modelNotFound) {
        throw error;
      }
    }
  }

  throw lastError || new Error('No supported Groq model was available');
};

// @desc    Apply to a job
// @route   POST /api/user/apply/:jobId
// @access  Private
const applyToJob = async (req, res) => {
  const fs = require('fs');
  const path = require('path');
  let tempPath = null;

  try {
    const { resume } = req.body;
    const file = req.file;
    const jobId = req.params.jobId;

    if (!resume && !file) {
      return res.status(400).json({ message: 'Please provide a resume' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const existingApp = await Application.findOne({ userId: req.user._id, jobId });
    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    let analysis = null;
    let storedResume = resume;

    if (file) {
      tempPath = file.path;

      const ext = path.extname(file.originalname) || '.pdf';
      const namedPath = tempPath + ext;
      fs.renameSync(tempPath, namedPath);
      tempPath = namedPath;

      analysis = await analyzeResumeFile(tempPath, file, job.description);
      storedResume = file.originalname;
    } else {
      analysis = await analyzeResumeText(resume, job.description);
    }

    const application = new Application({
      userId: req.user._id,
      jobId,
      resume: storedResume,
      atsScore: analysis?.ats_score || analysis?.atsScore || 0,
      strengths: analysis?.strengths || [],
      weaknesses: analysis?.weaknesses || [],
      techStack: analysis?.required_tech_stack || analysis?.techStack || [],
      ranking: analysis?.ats_score || analysis?.atsScore || 0,
      status: 'reviewed',
    });

    const createdApplication = await application.save();
    res.status(201).json(createdApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    if (tempPath) {
      try { fs.unlinkSync(tempPath); } catch (_) { }
    }
  }
};

// @desc    Analyze a resume (for a specific job) and return score immediately
// @route   POST /api/user/analyze-resume
// @access  Private
const analyzeResume = async (req, res) => {
  try {
    const { resume, jobId } = req.body;

    if (!resume || !jobId) {
      return res.status(400).json({ message: 'Please provide both resume and jobId' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found to analyze against' });
    }

    // Call RAG API
    const data = await analyzeResumeText(resume, job.description);

    // Check if the user has an application for this job to update it
    const application = await Application.findOne({ userId: req.user._id, jobId });

    if (application) {
      application.atsScore = data.ats_score || data.atsScore || 0;
      application.strengths = data.strengths || [];
      application.weaknesses = data.weaknesses || [];
      application.techStack = data.required_tech_stack || data.techStack || [];
      application.ranking = application.atsScore;
      if (application.status === 'pending') {
        application.status = 'reviewed';
      }
      await application.save();
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Analyze resume directly — sends file to RAG API
// @route   POST /api/user/analyze-direct
// @access  Private
const analyzeResumeDirect = async (req, res) => {
  const fs = require('fs');
  const path = require('path');
  let tempPath = null;

  try {
    const { jd_data } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'Please upload a resume file (PDF, DOCX, or TXT)' });
    }
    if (!jd_data) {
      return res.status(400).json({ message: 'Please provide the job description' });
    }

    tempPath = file.path; // multer disk storage saves here

    // Rename to include original extension so RAG model recognises the file type
    const ext = path.extname(file.originalname) || '.pdf';
    const namedPath = tempPath + ext;
    fs.renameSync(tempPath, namedPath);
    tempPath = namedPath;

    const data = await analyzeResumeFile(tempPath, file, jd_data);
    res.json(data);
  } catch (error) {
    console.error('RAG API error:', error.response?.data || error.message);
    res.status(500).json({ message: error.response?.data?.detail || error.message });
  } finally {
    if (tempPath) {
      try { require('fs').unlinkSync(tempPath); } catch (_) { }
    }
  }
};

// @desc    Get user applications
// @route   GET /api/user/applications
// @access  Private
const getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate('jobId', 'title company')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single user application
// @route   GET /api/user/applications/:id
// @access  Private
const getUserApplicationById = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('jobId', 'title company description requiredSkills');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Groq-powered assistant for the user dashboard
// @route   POST /api/user/assistant
// @access  Private
const assistantChat = async (req, res) => {
  try {
    const { prompt, history = [] } = req.body;

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({ message: 'Please enter a prompt for the assistant' });
    }

    const [applications, jobs] = await Promise.all([
      Application.find({ userId: req.user._id })
        .populate('jobId', 'title company')
        .sort({ createdAt: -1 })
        .lean(),
      Job.find({})
        .sort({ createdAt: -1 })
        .select('title company requiredSkills')
        .limit(6)
        .lean(),
    ]);

    const assistantPrompt = buildAssistantPrompt({
      userName: req.user.name,
      prompt: String(prompt).trim(),
      history,
      applications,
      jobs,
    });

    const { text, model } = await callGroq(assistantPrompt);
    return res.json({ answer: text, model, provider: 'groq' });
  } catch (error) {
    console.error('Groq assistant failed:', error.response?.data || error.message);
    return res.status(500).json({
      message:
        error.response?.data?.error?.message ||
        error.response?.data?.error ||
        error.message ||
        'Groq assistant failed',
    });
  }
};

module.exports = {
  applyToJob,
  analyzeResume,
  analyzeResumeDirect,
  assistantChat,
  getUserApplications,
  getUserApplicationById
};
