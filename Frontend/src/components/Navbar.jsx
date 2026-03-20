import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BrainCircuit, BriefcaseBusiness, LogOut, Menu, Sparkles, UserCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isHR } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const hiddenPaths = ['/login', '/signup', '/user/ask-doubt', '/user/analyze-resume'];
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const homePath = isAuthenticated ? (isHR ? '/hr/dashboard' : '/user/dashboard') : '/login';

  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  const navLinks = isAuthenticated
    ? isHR
      ? [
          { to: '/hr/dashboard', label: 'Dashboard' },
          { to: '/hr/manage-jobs', label: 'Manage Jobs' },
          { to: '/hr/create-job', label: 'Post Job' },
        ]
      : [
          { to: '/user/dashboard', label: 'Dashboard' },
          { to: '/jobs', label: 'Jobs' },
          { to: '/user/analyze-resume', label: 'Resume Analyzer' },
          { to: '/user/ask-doubt', label: 'Ask Doubt' },
        ]
    : [{ to: '/jobs', label: 'Jobs' }];

  const isActivePath = (path) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <nav className="sticky top-0 z-50 px-3 pt-2 lg:px-5">
      <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-transparent bg-transparent shadow-none">
        <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <Link
              to={homePath}
              className="flex items-center gap-3 rounded-2xl px-1 py-1 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 via-slate-800 to-blue-700 text-white shadow-lg shadow-slate-900/20">
                <BrainCircuit className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Smart hiring</p>
                <p className="text-base font-bold text-slate-900 sm:text-lg">ATS Analyzer</p>
              </div>
            </Link>
          </div>

          <div className="hidden items-center gap-1.5 lg:flex">
            {navLinks.map((link) => {
              const isActive = isActivePath(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-slate-950 to-slate-800 text-white shadow-lg shadow-slate-900/15 ring-1 ring-amber-200/40'
                      : 'text-slate-600 hover:bg-white/45 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {!isAuthenticated ? (
              !isAuthPage && (
                <>
                  <Link
                    to="/login"
                    className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-950 to-slate-800 px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:from-slate-900 hover:to-blue-700"
                  >
                    <Sparkles className="h-4 w-4" />
                    Sign up
                  </Link>
                </>
              )
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="hidden rounded-full bg-white/45 px-3 py-1.5 text-right shadow-sm xl:block">
                  <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">{user?.role}</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700 ring-1 ring-amber-100">
                  <UserCircle2 className="h-4 w-4" />
                  <span className="text-sm font-semibold">{isHR ? 'Recruiter' : 'Candidate'}</span>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/45 px-3.5 py-2 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:text-slate-900"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/50 bg-white/45 text-slate-700 transition-colors hover:text-slate-900 lg:hidden"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="rounded-[1.75rem] border border-white/50 bg-white/80 px-4 pb-4 pt-3 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden">
            {isAuthenticated && (
              <div className="mb-3 rounded-2xl bg-slate-900 px-4 py-2.5 text-white">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{user?.role}</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = isActivePath(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-slate-950 to-slate-800 text-white'
                        : 'bg-white/80 text-slate-700 hover:bg-amber-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{link.label}</span>
                    <BriefcaseBusiness className="h-4 w-4" />
                  </Link>
                );
              })}

              {!isAuthenticated && !isAuthPage && (
                <>
                  <Link to="/login" className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700">
                    Login
                  </Link>
                  <Link to="/signup" className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
                    Sign up
                  </Link>
                </>
              )}

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
