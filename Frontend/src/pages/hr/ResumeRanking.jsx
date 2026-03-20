import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Loader2, Trophy, XCircle } from 'lucide-react';
import HRSidebar from '../../components/HRSidebar';
import { getJobApplicantsAPI } from '../../services/api';

const ResumeRanking = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [rankedApplicants, setRankedApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await getJobApplicantsAPI(jobId);
        const applicants = response.data.applicants || [];
        const sortedApplicants = [...applicants].sort(
          (a, b) => (b.ranking || b.atsScore || 0) - (a.ranking || a.atsScore || 0)
        );

        setJob(response.data.job);
        setRankedApplicants(sortedApplicants);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load ranking data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRanking();
  }, [jobId]);

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  if (!job) {
    return <div className="p-8 text-gray-700">{error || 'Job not found'}</div>;
  }

  return (
    <div className="flex gap-8 max-w-7xl mx-auto pb-12">
      <HRSidebar />

      <div className="flex-1">
        <div className="mb-6">
          <Link to={`/hr/applicants/${job._id}`} className="text-gray-500 hover:text-indigo-600 flex items-center gap-1 text-sm font-medium mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Applicants
          </Link>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Trophy className="w-8 h-8 text-yellow-500" />
                Resume Auto-Ranking
              </h1>
              <p className="text-gray-600 text-lg">Top candidates for {job.title}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {rankedApplicants.length > 0 ? rankedApplicants.map((app, index) => (
            <div key={app._id} className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col lg:flex-row gap-6 transition-all ${index === 0 ? 'border-yellow-300 bg-yellow-50/30 shadow-md' : 'border-gray-100 hover:border-indigo-200'}`}>
              <div className="flex items-center gap-6 lg:w-1/4 pb-4 lg:pb-0 border-b lg:border-b-0 lg:border-r border-gray-100 pr-6">
                <div className={`text-4xl font-black ${index === 0 ? 'text-yellow-500' : 'text-gray-300'}`}>
                  #{index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">{app.userId?.name || 'Unknown User'}</h3>
                  <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                    (app.atsScore || 0) >= 75 ? 'bg-green-100 text-green-700' :
                    (app.atsScore || 0) >= 50 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {(app.atsScore || 0)}% Match
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                <div>
                  <h4 className="flex items-center gap-1.5 text-sm font-bold text-green-800 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" /> Key Strengths
                  </h4>
                  {app.strengths?.length ? (
                    <ul className="text-sm text-gray-600 space-y-1">
                      {app.strengths.slice(0, 3).map((strength, idx) => (
                        <li key={idx} className="flex gap-1.5"><span className="text-green-500">-</span> {strength}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400">No strengths recorded yet.</p>
                  )}
                </div>

                <div>
                  <h4 className="flex items-center gap-1.5 text-sm font-bold text-red-800 mb-2">
                    <XCircle className="w-4 h-4 text-red-500" /> Missing / Weaknesses
                  </h4>
                  {app.weaknesses?.length ? (
                    <ul className="text-sm text-gray-600 space-y-1">
                      {app.weaknesses.slice(0, 2).map((weakness, idx) => (
                        <li key={idx} className="flex gap-1.5"><span className="text-red-400">-</span> {weakness}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400">No weaknesses recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-gray-500">
              No applicants available to rank yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeRanking;
