# AI Resume Screener

An AI-powered recruitment platform with role-based dashboards for HR and candidates. Candidates get instant ATS-style resume scoring against a job description, and an AI career assistant for guidance — while HR can post jobs, review applicants, and trigger bulk resume analysis.

**Live demo:** [AI Resume Screener](https://ai-resume-screener-rav4.vercel.app/login)

---

## Features

- **Role-based auth** — Register/login as a `user` (candidate) or `hr`, plus Google OAuth and guest access (guests are limited to resume scoring only)
- **AI resume-to-JD matching** — Upload a resume (PDF/DOCX/TXT) or paste text, get back an ATS score, strengths, weaknesses, and required tech stack
- **AI career assistant** — In-app chatbot that gives personalized career advice based on the candidate's real applications and available jobs
- **HR dashboard** — Post jobs, view applicant counts, rank applicants by ATS score, bulk-analyze all resumes for a job
- **Resume builder** — In-app tool for candidates to put together a resume
- **Application tracking** — Candidates can track status (pending / reviewed / accepted / rejected) across all their applications

## Architecture

The project is split into three independent services:

```
┌─────────────────┐      ┌──────────────────┐      ┌───────────────────────┐
│   Frontend       │ ───► │   Backend API     │ ───► │   RAG Microservice     │
│  React + Vite     │      │  Node/Express     │      │  (Python, hosted       │
│  Tailwind CSS     │ ◄─── │  + MongoDB        │ ◄─── │   separately on Render)│
└─────────────────┘      └──────────────────┘      └───────────────────────┘
```

- **Frontend** — React 19, Vite, Tailwind CSS, React Router. Talks to the backend over Axios; JWT is attached to every request via an interceptor.
- **Backend** — Node.js/Express 5 + MongoDB (Mongoose). Handles auth, jobs, and applications, and acts as the orchestration layer — it does not run any AI itself.
- **RAG Microservice** — A separate Python service that performs the actual resume/job-description matching and returns the ATS score, strengths, weaknesses, and required tech stack. Deployed independently; the backend calls it over HTTP.
- **Groq LLM integration** — Lives inside the Node backend and powers the in-app career assistant (tries `llama-3.1-8b-instant` → `llama-3.3-70b-versatile` → `gpt-oss-20b` as fallbacks).

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, React Router, Axios, Lucide Icons

**Backend:** Node.js, Express 5, MongoDB, Mongoose, JWT, bcryptjs, Multer, Axios

**AI/ML:** External RAG-based resume-analysis microservice (Python), Groq API (LLaMA models) for the career assistant

## Project Structure

```
AI-Resume-Screener/
├── Backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # auth, job, and user business logic
│   ├── middleware/       # JWT auth, role guards (hrOnly, registeredUsersOnly)
│   ├── models/           # User, Job, Application (Mongoose schemas)
│   ├── routes/           # /api/auth, /api/jobs, /api/user
│   ├── utils/             # skill normalization helpers
│   └── server.js
└── Frontend/
    └── src/
        ├── components/    # shared UI (ATSScoreCard, ResumeUpload, chat panel, etc.)
        ├── context/        # AuthContext
        ├── pages/
        │   ├── public/      # Home, Login, Signup, Job Listings
        │   ├── user/         # Resume Analyzer, Resume Builder, Ask a Doubt, Applications
        │   └── hr/            # Dashboard, Create/Manage Jobs, Applicants, Resume Ranking
        └── services/api.js  # centralized Axios API client
```

## Getting Started

### Prerequisites
- Node.js and npm
- A MongoDB connection string (local or Atlas)
- A Groq API key (for the career assistant)
- URL of a running RAG resume-analysis service (or your own instance)

### Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
RAG_API_URL=https://your-rag-service-url/analyze_resume
GOOGLE_CLIENT_ID=your_google_oauth_client_id   # optional, for Google login
```

Run the server:

```bash
npm run dev      # with nodemon
# or
npm start
```

### Frontend Setup

```bash
cd Frontend
npm install
```

Create a `.env` file in `Frontend/` (optional — defaults to `/api` in dev):

```env
VITE_API_URL=http://localhost:5000/api
```

Run the dev server:

```bash
npm run dev
```

## API Overview

| Route | Method | Access | Description |
|---|---|---|---|
| `/api/auth/register` | POST | Public | Register a new user |
| `/api/auth/login` | POST | Public | Log in |
| `/api/auth/guest` | POST | Public | Create a guest session |
| `/api/auth/google` | POST | Public | Google OAuth login |
| `/api/jobs` | GET/POST | Public / HR | List jobs / create a job |
| `/api/jobs/:id/applicants` | GET | HR | View applicants for a job |
| `/api/jobs/:id/analyze-resumes` | POST | HR | Bulk-analyze all applicants for a job |
| `/api/user/apply/:jobId` | POST | User | Apply to a job with a resume |
| `/api/user/analyze-direct` | POST | User | Analyze a resume against a JD directly |
| `/api/user/assistant` | POST | User | Chat with the AI career assistant |
| `/api/user/applications` | GET | User | List the current user's applications |

## Author

**Suman Panda** — [GitHub](https://github.com/Suman-collab) · [LinkedIn](https://linkedin.com/in/suman-panda-330672236)
