import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Eye, EyeOff, Loader2, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import GoogleAuthButton from '../../components/GoogleAuthButton';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login, googleAuth, loginAsGuest } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError(err || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async (credential) => {
    setError('');
    setIsGoogleLoading(true);

    try {
      await googleAuth(credential);
    } catch (err) {
      setError(err || 'Google authentication failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGuestAuth = async () => {
    setError('');
    setIsGuestLoading(true);

    try {
      await loginAsGuest();
    } catch (err) {
      setError(err || 'Guest authentication failed');
    } finally {
      setIsGuestLoading(false);
    }
  };

  const isCompact = true;

  return (
    <div className="flex min-h-[85vh] items-center justify-center">
      <div className="w-full max-w-6xl">
        <div
          className={`soft-ring mx-auto grid w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 backdrop-blur-xl transition-all duration-300 ${
            isCompact
              ? 'max-w-4xl md:grid-cols-[0.92fr_1.08fr]'
              : 'max-w-5xl md:grid-cols-[1.05fr_0.95fr]'
          }`}
        >
        <div className={`relative overflow-hidden bg-slate-900 text-white transition-all ${isCompact ? 'p-8' : 'p-10'}`}>
          <div className="relative z-10">
            <Link to="/" className={`inline-flex items-center gap-3 ${isCompact ? 'mb-8' : 'mb-12'}`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <BrainCircuit className="h-6 w-6 text-sky-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">AI hiring workspace</p>
                <p className="text-2xl font-bold">ATS Analyzer</p>
              </div>
            </Link>

            <div className={`inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200 ${isCompact ? 'mb-6' : 'mb-8'}`}>
              <Sparkles className="h-4 w-4" />
              Faster resume decisions
            </div>

            <h1 className={`max-w-md font-bold leading-tight ${isCompact ? 'text-3xl' : 'text-4xl'}`}>Welcome back to a cleaner, smarter hiring workflow.</h1>
            <p className={`max-w-md text-sm text-slate-300 ${isCompact ? 'mt-3 leading-6' : 'mt-4 leading-7'}`}>
              Sign in to review ATS insights, track applications, and keep your hiring pipeline moving without the clutter.
            </p>

            <div className={`grid gap-4 sm:grid-cols-2 ${isCompact ? 'mt-7' : 'mt-10'}`}>
              <div className="rounded-2xl bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Resume insights</p>
                <p className="mt-2 text-2xl font-bold">Instant</p>
              </div>
              <div className="rounded-2xl bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Hiring view</p>
                <p className="mt-2 text-2xl font-bold">Shared</p>
              </div>
            </div>

            <div className={`hidden rounded-3xl border border-white/10 bg-white/8 md:block ${isCompact ? 'mt-7 p-5' : 'mt-10 p-6'}`}>
              <p className="text-sm italic leading-7 text-slate-200">
                "It feels easier to spot strong candidates and weak resumes without bouncing across multiple tools."
              </p>
              <p className="mt-4 text-sm font-semibold text-white">Sarah Jenkins, HR Director</p>
            </div>
          </div>

          <div className="absolute -right-10 top-8 h-48 w-48 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute -bottom-10 left-0 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        <div className={`bg-white/70 transition-all ${isCompact ? 'p-7 sm:p-8' : 'p-8 sm:p-10'}`}>
          <h2 className="text-3xl font-bold text-slate-900">Sign in</h2>
          <p className="mt-2 text-sm text-slate-500">
            Do not have an account?{' '}
            <Link to="/signup" className="font-semibold text-indigo-600 transition-colors hover:text-indigo-800">
              Create one
            </Link>
          </p>

          <form onSubmit={handleSubmit} className={`space-y-5 ${isCompact ? 'mt-6' : 'mt-8'}`}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors focus-within:border-indigo-300">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <a href="#" className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-800">
                  Forgot password?
                </a>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors focus-within:border-indigo-300">
                <LockKeyhole className="h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="text-slate-400 transition-colors hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Remember me for 30 days
              </label>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                Secure access
              </span>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading || isGuestLoading}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className={`border-t border-slate-200 ${isCompact ? 'mt-6 pt-6' : 'mt-8 pt-8'}`}>
            <GoogleAuthButton
              mode="signin"
              disabled={isLoading || isGoogleLoading}
              onCredential={handleGoogleAuth}
              onError={(message) => {
                const nextMessage =
                  typeof message === 'string'
                    ? message
                    : message?.message || 'Google authentication failed';
                setError(nextMessage);
              }}
            />
            {isGoogleLoading && (
              <p className="mt-3 text-center text-sm text-slate-500">Signing you in with Google...</p>
            )}

            <button
              type="button"
              onClick={handleGuestAuth}
              disabled={isLoading || isGoogleLoading || isGuestLoading}
              className={`mt-4 w-full group inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {isGuestLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
              ) : (
                <>
                  <BrainCircuit className="h-4 w-4 text-slate-500" />
                  Try ATS Scanner as Guest
                </>
              )}
            </button>

            <p className="mt-5 text-center text-xs leading-6 text-slate-500">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="underline transition-colors hover:text-indigo-600">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="underline transition-colors hover:text-indigo-600">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
