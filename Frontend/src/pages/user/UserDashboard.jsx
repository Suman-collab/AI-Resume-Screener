import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileCheck, BrainCircuit, Clock, CheckCircle, MessageSquareMore, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getJobsAPI, getUserApplicationsAPI } from '../../services/api';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-4 rounded-xl ${color}`}>
      <Icon className="w-7 h-7" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-0.5">{label}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

const statusStyle = {
  pending:  { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Clock },
  reviewed: { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: FileCheck },
  accepted: { bg: 'bg-green-50',  text: 'text-green-700',  icon: CheckCircle },
  rejected: { bg: 'bg-red-50',    text: 'text-red-700',    icon: XCircle },
};

const UserDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          getJobsAPI(),
          getUserApplicationsAPI(),
        ]);
        setJobs(jobsRes.data.slice(0, 6)); // show latest 6 jobs
        setApplications(appsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalApps = applications.length;
  const avgScore = totalApps > 0
    ? Math.round(applications.reduce((sum, a) => sum + (a.atsScore || 0), 0) / totalApps)
    : '—';

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'there'}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your applications.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/user/analyze-resume"
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold shadow-md hover:bg-indigo-700 transition-all text-sm whitespace-nowrap"
          >
            <BrainCircuit className="w-4 h-4" /> Test My Resume
          </Link>
          <Link
            to="/user/ask-doubt"
            className="flex items-center gap-2 bg-white text-slate-700 px-5 py-3 rounded-xl font-semibold shadow-sm border border-slate-200 hover:border-indigo-200 hover:text-indigo-700 transition-all text-sm whitespace-nowrap"
          >
            <MessageSquareMore className="w-4 h-4" /> Ask Doubt
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <StatCard icon={Briefcase}  label="Total Applications" value={totalApps}  color="bg-indigo-50 text-indigo-600" />
        <StatCard icon={FileCheck}  label="Avg ATS Score"       value={avgScore === '—' ? '—' : `${avgScore}%`} color="bg-green-50 text-green-600" />
        <StatCard icon={Clock}      label="Available Jobs"      value={jobs.length} color="bg-amber-50 text-amber-600" />
      </div>

      {/* Recent Applications */}
      {applications.length > 0 && (
        <div className="mb-10">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Applications</h2>
            <Link to="/user/applications" className="text-sm text-indigo-600 font-medium hover:text-indigo-800">View All →</Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {applications.slice(0, 4).map(app => {
              const s = statusStyle[app.status] || statusStyle.pending;
              const StatusIcon = s.icon;
              return (
                <div key={app._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{app.jobId?.title || 'Job Application'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{app.jobId?.company || ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {app.atsScore > 0 && (
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        ATS {app.atsScore}%
                      </span>
                    )}
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {app.status?.charAt(0).toUpperCase() + app.status?.slice(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommended Jobs */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-gray-900">Available Jobs</h2>
          <Link to="/jobs" className="text-sm text-indigo-600 font-medium hover:text-indigo-800">View All →</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-4"></div>
                <div className="flex gap-2"><div className="h-6 bg-gray-100 rounded-full w-16"></div><div className="h-6 bg-gray-100 rounded-full w-20"></div></div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-gray-500 text-sm">No jobs available right now. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map(job => (
              <div key={job._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-indigo-200 transition-all flex flex-col gap-3">
                <div>
                  <h3 className="font-bold text-gray-900">{job.title}</h3>
                  <p className="text-sm text-gray-500">{job.company || ''}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(job.requiredSkills || []).slice(0, 3).map((s, i) => (
                    <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">{s}</span>
                  ))}
                </div>
                <Link
                  to={`/user/apply/${job._id}`}
                  className="mt-auto text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Apply Now →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
