import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Clock3,
  Grid2X2,
  LayoutList,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getJobsAPI } from '../../services/api';

const parseSkillTokens = (skill) => {
  const value = String(skill || '').trim();
  if (!value) return [];

  // Split composite inputs like "C++ Web Development: - HTML - CSS - React"
  const tokens = value
    .replace(/\s*[:|]\s*/g, ',')
    .replace(/\s*[-•–—]\s*/g, ',')
    .split(/[,;]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  return tokens;
};

const getTopSkills = (jobs) => {
  const skillCounts = jobs.reduce((counts, job) => {
    (job.requiredSkills || []).forEach((skill) => {
      parseSkillTokens(skill).forEach((token) => {
        const normalized = token;
        counts[normalized] = (counts[normalized] || 0) + 1;
      });
    });

    return counts;
  }, {});

  return Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([skill]) => skill);
};

const JobListings = () => {
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [topSkills, setTopSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeSkill, setActiveSkill] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await getJobsAPI();
        setJobs(res.data);
        setFiltered(res.data);
        setTopSkills(getTopSkills(res.data));
      } catch (err) {
        setError('Failed to load job listings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    const query = search.trim().toLowerCase();

    let next = jobs.filter((job) => {
      const requiredSkills = (job.requiredSkills || []).flatMap((skill) => parseSkillTokens(skill));
      const lowerSkills = requiredSkills.map((skill) => skill.toLowerCase());

      const matchesSearch =
        !query ||
        job.title?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        lowerSkills.some((skill) => skill.includes(query)) ||
        job.company?.toLowerCase().includes(query);

      const matchesSkill =
        activeSkill === 'All' ||
        lowerSkills.some((skill) => skill === activeSkill.toLowerCase());

      return matchesSearch && matchesSkill;
    });

    if (sortBy === 'title') {
      next = [...next].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    if (sortBy === 'skills') {
      next = [...next].sort((a, b) => (b.requiredSkills?.length || 0) - (a.requiredSkills?.length || 0));
    }

    setFiltered(next);
  }, [activeSkill, jobs, search, sortBy]);

  return (
    <div className="mx-auto max-w-6xl pb-10">
      <div className="mb-6 rounded-[1.75rem] bg-slate-900 px-5 py-6 text-white shadow-2xl shadow-slate-900/10 sm:px-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
              <Sparkles className="h-4 w-4" />
              Job discovery
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-[2rem]">Browse roles with faster, smarter filtering.</h1>
            <p className="mt-2.5 text-sm leading-6 text-slate-300 sm:text-base">
              Open a job card to see the full project information, or apply directly from the listing.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left sm:grid-cols-3">
            <div className="rounded-2xl bg-white/8 px-4 py-2.5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Live roles</p>
              <p className="mt-1.5 text-xl font-bold">{jobs.length}</p>
            </div>
            <div className="rounded-2xl bg-white/8 px-4 py-2.5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Skill tags</p>
              <p className="mt-1.5 text-xl font-bold">{topSkills.length}</p>
            </div>
            <div className="rounded-2xl bg-white/8 px-4 py-2.5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Results</p>
              <p className="mt-1.5 text-xl font-bold">{filtered.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel mb-6 rounded-[1.75rem] border border-white/70 p-4 sm:p-5">
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <Search className="h-5 w-5 shrink-0 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, company, skill, or keyword..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-indigo-300"
            >
              <option value="recent">Sort: Most recent</option>
              <option value="title">Sort: Title A-Z</option>
              <option value="skills">Sort: Most skills</option>
            </select>

            <div className="flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
                  viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Grid2X2 className="h-4 w-4" />
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
                  viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutList className="h-4 w-4" />
                List
              </button>
            </div>
          </div>
        </div>

        {topSkills.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSkill('All')}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all ${
                activeSkill === 'All'
                  ? 'bg-black text-white shadow-lg shadow-black/25'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-slate-900'
              }`}
            >
              All skills
            </button>
            {topSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => setActiveSkill(skill)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all ${
                  activeSkill === skill
                    ? 'bg-black text-white shadow-lg shadow-black/25'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-slate-900'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
            <p className="text-sm font-medium">Loading jobs...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="glass-panel rounded-[1.75rem] border border-white/70 px-6 py-12 text-center">
          <Briefcase className="mx-auto mb-3 h-12 w-12 text-slate-300" />
          <p className="text-lg font-semibold text-slate-700">{search ? 'No jobs match your search yet.' : 'No job listings yet.'}</p>
          <p className="mt-2 text-sm text-slate-500">
            {search ? 'Try a broader keyword or switch the selected skill filter.' : 'Check back a little later for new opportunities.'}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
          {filtered.map((job) => {
            const summary = (job.description || 'No job description has been shared yet.')
              .replace(/\s*\r?\n\s*/g, ' ')
              .replace(/\s{2,}/g, ' ')
              .trim();
            const fastApplyTarget = isAuthenticated ? `/user/apply/${job._id}` : '/login';

            return (
              <div
                key={job._id}
                className={`glass-panel rounded-[1.5rem] border border-white/70 p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 ${
                  viewMode === 'list' ? 'flex flex-col gap-4 md:flex-row md:items-center md:justify-between' : 'flex flex-col gap-4'
                }`}
              >
                <Link to={`/jobs/${job._id}`} className="block flex-1 rounded-[1.25rem] transition-transform hover:-translate-y-0.5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                      <p className="mt-0.5 text-sm font-medium text-slate-500">{job.company || 'Company name coming soon'}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                      Open
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-slate-600">
                    {summary.length > 120 ? `${summary.slice(0, 120)}...` : summary}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(job.requiredSkills || []).slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </Link>

                <div className={`flex ${viewMode === 'list' ? 'md:w-56 md:flex-col md:items-end' : 'items-center justify-between'} gap-3`}>
                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{job.location || 'Remote / Flexible'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5" />
                      <span>{job.type || 'Full-time'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <Link
                      to={`/jobs/${job._id}`}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-indigo-200 hover:text-indigo-700"
                    >
                      View details
                    </Link>
                    <Link
                      to={fastApplyTarget}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-600"
                    >
                      Apply
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobListings;
