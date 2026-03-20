import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BrainCircuit, Loader2, Mail } from 'lucide-react';
import HRSidebar from '../../components/HRSidebar';
import { getJobApplicantsAPI, analyzeResumesAPI } from '../../services/api';

const ApplicantsList = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await getJobApplicantsAPI(jobId);
        setJob(res.data.job);
        setApplicants(res.data.applicants || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to fetch applicants.');
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchApplicants();
    }
  }, [jobId]);

  const handleAnalyzeResumes = async () => {
    setIsAnalyzing(true);
    setError('');

    try {
      await analyzeResumesAPI(jobId);
      const res = await getJobApplicantsAPI(jobId);
      setJob(res.data.job);
      setApplicants(res.data.applicants || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to analyze resumes.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-600 w-8 h-8" /></div>;
  }

  if (!job) {
    return <div className="p-8 text-gray-700">{error || 'Job not found'}</div>;
  }

  return (
    <div className="flex gap-8 max-w-7xl mx-auto pb-12">
      <HRSidebar />

      <div className="flex-1">
        <div className="mb-6">
          <Link to="/hr/manage-jobs" className="text-gray-500 hover:text-indigo-600 flex items-center gap-1 text-sm font-medium mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </Link>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Applicants</h1>
              <p className="text-gray-600 text-lg">{job.title}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAnalyzeResumes}
                disabled={isAnalyzing || !applicants.some((app) => app.atsScore === 0)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300 transition-all"
              >
                <BrainCircuit className={`w-5 h-5 ${isAnalyzing ? 'animate-pulse' : ''}`} />
                {isAnalyzing ? 'Analyzing AI...' : 'Analyze Pending Resumes'}
              </button>
              <Link
                to={`/hr/ranking/${job._id}`}
                className="flex items-center gap-2 bg-white border border-indigo-600 text-indigo-600 px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-indigo-50 transition-all"
              >
                View Auto-Ranking
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {applicants.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Candidate Name</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">ATS Score</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applicants.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{app.userId?.name || 'Unknown User'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{app.userId?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${app.atsScore > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {app.atsScore > 0 ? 'Analyzed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {app.atsScore > 0 ? (
                        <span className="text-sm font-bold text-gray-900">{app.atsScore}%</span>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {app.userId?.email ? (
                        <a
                          href={`mailto:${app.userId.email}`}
                          className="text-indigo-600 hover:text-indigo-900 inline-flex items-center justify-end gap-1 w-full"
                        >
                          Contact <Mail className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-gray-300">No email</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-10 text-center text-gray-500">No applicants yet for this job.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantsList;
