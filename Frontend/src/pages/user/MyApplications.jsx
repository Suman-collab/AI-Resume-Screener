import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Calendar, ChevronRight, FileText, Loader2 } from 'lucide-react';
import { getUserApplicationsAPI } from '../../services/api';

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await getUserApplicationsAPI();
        setApplications(response.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load applications.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">Track the status and scores of jobs you've applied to.</p>
        </div>
        <Link
          to="/jobs"
          className="bg-white border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Find More Jobs
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-12 text-indigo-600">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : applications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {applications.map((app) => (
              <div
                key={app._id}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/user/score/${app._id}`)}
              >
                <div className="flex-1 mb-4 sm:mb-0">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{app.jobId?.title || 'Application'}</h3>
                  <div className="flex items-center text-sm text-gray-500 gap-4">
                    <div className="flex items-center gap-1.5 font-medium text-indigo-700">
                      <Building2 className="w-4 h-4" /> {app.jobId?.company || 'Company'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" /> Applied {formatDate(app.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center sm:items-end">
                    <span className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Status</span>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      app.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {app.status || 'pending'}
                    </div>
                  </div>

                  <div className="flex flex-col items-center sm:items-end">
                    <span className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">ATS Score</span>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5 ${
                      app.atsScore >= 75 ? 'bg-green-100 text-green-700' :
                      app.atsScore >= 50 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      <FileText className="w-4 h-4" />
                      {app.atsScore}% Match
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 hidden sm:block" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-12">
            {error && <p className="text-red-600 mb-3">{error}</p>}
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500">You haven't applied to any jobs yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
