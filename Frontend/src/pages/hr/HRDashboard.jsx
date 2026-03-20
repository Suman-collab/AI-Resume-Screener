import React, { useEffect, useState } from 'react';
import { Briefcase, Loader2, Users } from 'lucide-react';
import HRSidebar from '../../components/HRSidebar';
import JobCard from '../../components/JobCard';
import { getHRDashboardAPI } from '../../services/api';

const HRDashboard = () => {
  const [stats, setStats] = useState({ activeJobs: 0, totalApplicants: 0 });
  const [recentJobs, setRecentJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getHRDashboardAPI();
        setStats(response.data.stats || { activeJobs: 0, totalApplicants: 0 });
        setRecentJobs(response.data.recentJobs || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="flex gap-8 max-w-7xl mx-auto">
      <HRSidebar />

      <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">HR Overview</h1>
        <p className="text-gray-600 mb-8">Manage your postings and review applicant matches.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-indigo-50 p-4 rounded-xl">
              <Briefcase className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Active Job Postings</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.activeJobs}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-50 p-4 rounded-xl">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Applicants</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalApplicants}</h3>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Job Postings</h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12 text-indigo-600">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : recentJobs.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {recentJobs.map((job) => (
                <JobCard key={job._id} job={job} role="hr" />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-gray-500">
              No jobs posted yet. Create a job to start reviewing applicants.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
