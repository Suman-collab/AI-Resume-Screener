import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Clock3, Loader2, MapPin, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ReadableJobDescription from '../../components/ReadableJobDescription';
import { getJobDetailsAPI } from '../../services/api';

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isGuest } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await getJobDetailsAPI(jobId);
        setJob(response.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl py-10">
        <div className="glass-panel rounded-[1.75rem] border border-white/70 px-6 py-10 text-center">
          <p className="text-lg font-semibold text-slate-800">{error || 'Job not found.'}</p>
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to jobs
          </button>
        </div>
      </div>
    );
  }

  const applyTarget = isGuest ? '/user/analyze-resume' : isAuthenticated ? `/user/apply/${job._id}` : '/login';

  return (
    <div className="mx-auto max-w-6xl pb-10">
      <button
        type="button"
        onClick={() => navigate('/jobs')}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </button>

      <div className="mb-6 rounded-[2rem] bg-slate-900 px-6 py-7 text-white shadow-2xl shadow-slate-900/10 sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
              <Sparkles className="h-4 w-4" />
              Job details
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-[2.4rem]">{job.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                <BriefcaseBusiness className="h-4 w-4" />
                {job.company || 'Company name coming soon'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                <MapPin className="h-4 w-4" />
                {job.location || 'Remote / Flexible'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                <Clock3 className="h-4 w-4" />
                {job.type || 'Full-time'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={applyTarget}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-all hover:-translate-y-0.5 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {isGuest ? 'Get ATS Score' : 'Apply'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="glass-panel rounded-[1.75rem] border border-white/70 p-5 sm:p-6">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Job description</h2>
          <ReadableJobDescription description={job.description} />
        </section>

        <aside className="space-y-6">
          <div className="glass-panel rounded-[1.75rem] border border-white/70 p-5">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Required skills</h3>
            <div className="flex flex-wrap gap-2">
              {(job.requiredSkills || []).length > 0 ? (
                job.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">Skills will be updated soon.</p>
              )}
            </div>
          </div>

          <div className="glass-panel rounded-[1.75rem] border border-white/70 p-5">
            <h3 className="mb-3 text-lg font-bold text-slate-900">Quick action</h3>
            <p className="mb-4 text-sm leading-6 text-slate-600">
              Ready for this role? Continue to the application page and submit your resume.
            </p>
            <Link
              to={applyTarget}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-600"
            >
              {isGuest ? 'Get ATS Score' : 'Apply now'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default JobDetails;
