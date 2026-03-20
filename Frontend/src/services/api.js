import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token to every request
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Auth Endpoints ---
export const loginAPI = (email, password) => api.post('/auth/login', { email, password });
export const registerAPI = (name, email, password, role) => api.post('/auth/register', { name, email, password, role });
export const googleAuthAPI = (credential, role) => api.post('/auth/google', { credential, role });
export const guestAuthAPI = () => api.post('/auth/guest');
export const getProfileAPI = () => api.get('/auth/profile');

// --- Job Endpoints ---
export const createJobAPI = (jobData) => api.post('/jobs', jobData);
export const getJobsAPI = () => api.get('/jobs');
export const getJobDetailsAPI = (jobId) => api.get(`/jobs/${jobId}`);
export const getHRDashboardAPI = () => api.get('/jobs/hr/overview');
export const getHRJobsAPI = () => api.get('/jobs/hr/list');
export const getJobApplicantsAPI = (jobId) => api.get(`/jobs/${jobId}/applicants`);
export const analyzeResumesAPI = (jobId) => api.post(`/jobs/${jobId}/analyze-resumes`);

// --- User Endpoints ---
export const applyToJobAPI = (jobId, resume) => {
  if (resume instanceof File) {
    const formData = new FormData();
    formData.append('resume', resume);

    return api.post(`/user/apply/${jobId}`, formData, {
      headers: { 'Content-Type': undefined },
      timeout: 120000,
    });
  }

  return api.post(`/user/apply/${jobId}`, { resume });
};
export const analyzeResumeAPI = (jobId, resume) => api.post('/user/analyze-resume', { jobId, resume });
export const analyzeResumeDirectAPI = (file, jd_data) => {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('jd_data', jd_data);
  // Set Content-Type to undefined to REMOVE the default 'application/json'
  // This lets the browser auto-set 'multipart/form-data; boundary=...' correctly
  return api.post('/user/analyze-direct', formData, {
    headers: { 'Content-Type': undefined },
    timeout: 120000,
  });
};
export const assistantChatAPI = (prompt, history = []) => api.post('/user/assistant', { prompt, history });
export const getUserApplicationsAPI = () => api.get('/user/applications');
export const getUserApplicationByIdAPI = (applicationId) => api.get(`/user/applications/${applicationId}`);

export default api;
