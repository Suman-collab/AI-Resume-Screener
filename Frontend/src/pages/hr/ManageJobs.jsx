import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Calendar, ChevronRight, Loader2, Users } from 'lucide-react';
import HRSidebar from '../../components/HRSidebar';
import { getHRJobsAPI } from '../../services/api';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await getHRJobsAPI();
        setJobs(res.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to fetch jobs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex gap-8 max-w-7xl mx-auto pb-12">
      <HRSidebar />

      <div className="flex-1">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Jobs</h1>
            <p className="text-gray-600">View your active job postings and access their applicants.</p>
          </div>
          <Link
            to="/hr/create-job"
            className="bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
          >
            Post New Job
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center p-12 text-indigo-600">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : jobs.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 mb-4 sm:mb-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 gap-4">
                      <div className="flex items-center gap-1.5 font-medium text-indigo-700">
                        <Building2 className="w-4 h-4" /> {job.company}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" /> Posted {formatDate(job.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center sm:items-end">
                      <span className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Applicants</span>
                      <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {job.applicantCount || 0}
                      </div>
                    </div>

                    <Link
                      to={`/hr/applicants/${job._id}`}
                      className="bg-white border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                    >
                      View Candidates <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
              <p className="text-gray-500 mb-6">Create your first job posting to start receiving applicants.</p>
              <Link
                to="/hr/create-job"
                className="bg-indigo-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Post a Job
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageJobs;
