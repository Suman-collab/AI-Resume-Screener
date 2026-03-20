import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Loader2, MapPin } from 'lucide-react';
import ReadableJobDescription from '../../components/ReadableJobDescription';
import ResumeUpload from '../../components/ResumeUpload';
import { applyToJobAPI, getJobDetailsAPI } from '../../services/api';

const ApplyJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await getJobDetailsAPI(jobId);
        setJob(response.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load job details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleApply = async () => {
    if (!resumeText && !resumeFile) {
      alert('Please provide your resume');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await applyToJobAPI(jobId, resumeFile || resumeText);
      navigate('/user/applications');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8"><Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" /></div>;
  }

  if (!job) {
    return <div className="text-center p-8 text-gray-600">{error || 'Job not found.'}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to jobs
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <div className="flex items-center text-gray-600 gap-4 mt-2">
              <div className="flex items-center gap-1.5 font-medium text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md">
                <Building2 className="w-4 h-4" /> {job.company}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> Remote
              </div>
            </div>
          </div>
          <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">Active</span>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <ReadableJobDescription description={job.description} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {(job.requiredSkills || []).map((skill) => (
              <span key={skill} className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <div className="mb-8 text-center text-gray-500 font-medium">
        &darr; Submit Your Application Below &darr;
      </div>

      <ResumeUpload onResumeSet={setResumeText} onFileSet={setResumeFile} />

      <div className="mt-8 flex justify-end gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          disabled={(!resumeText && !resumeFile) || isSubmitting}
          className="px-8 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed font-medium transition-all shadow-md hover:shadow-lg"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </div>
  );
};

export default ApplyJob;
