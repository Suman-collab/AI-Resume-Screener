import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Check, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const { register, loginAsGuest } = useAuth();
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '',
    email: '', 
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      await register(fullName, formData.email, formData.password, formData.role);
    } catch (err) {
      setError(err || 'Failed to create account');
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-[85vh] flex items-center justify-center -mt-8 py-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row-reverse border border-gray-100">
        
        {/* Right Side - Brand/Info */}
        <div className="bg-indigo-900 p-10 md:w-5/12 flex flex-col justify-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold mb-8">
              <BrainCircuit className="w-8 h-8 text-indigo-400" />
              ATS Analyzer
            </Link>
            <h2 className="text-3xl font-bold mb-6">Start your journey today.</h2>
            
            <ul className="space-y-4 text-indigo-100 mb-8">
              <li className="flex items-center gap-3">
                <div className="bg-indigo-800 p-1 rounded-full"><Check className="w-4 h-4 text-indigo-300" /></div>
                <span>Free Resume AI Analysis</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-indigo-800 p-1 rounded-full"><Check className="w-4 h-4 text-indigo-300" /></div>
                <span>Discover missing skills instantly</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-indigo-800 p-1 rounded-full"><Check className="w-4 h-4 text-indigo-300" /></div>
                <span>One-click ATS-optimized apply</span>
              </li>
            </ul>
          </div>
          
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <path fill="#818cf8" d="M42.7,-73.4C55.9,-67.8,67.6,-57.4,75.9,-44.6C84.2,-31.8,89.1,-15.9,89.5,0.2C89.9,16.4,85.8,32.8,77.3,46.7C68.8,60.6,55.9,72,41.2,78.5C26.5,85,10.1,86.6,-5.5,84.4C-21.1,82.2,-35.9,76.2,-49.6,67.6C-63.3,59,-75.9,47.8,-83.1,33.5C-90.3,19.2,-92.1,1.8,-88.4,-14.2C-84.7,-30.2,-75.5,-44.8,-63.4,-55.8C-51.3,-66.8,-36.3,-74.2,-21.5,-76.6C-6.7,-79,8.5,-76.4,22.4,-75L42.7,-73.4Z" transform="translate(200 200) scale(1.1)" />
            </svg>
          </div>
        </div>

        {/* Left Side - Form */}
        <div className="p-10 md:w-7/12 bg-white flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create account</h2>
          <p className="text-gray-500 mb-8">Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link></p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">I am a...</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleRoleChange('user')}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${
                    formData.role === 'user' 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-gray-200 text-gray-500 hover:border-indigo-200'
                  }`}
                >
                  Job Seeker
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('hr')}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${
                    formData.role === 'hr' 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-gray-200 text-gray-500 hover:border-indigo-200'
                  }`}
                >
                  Recruiter / HR
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                <input 
                  type="text" 
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  placeholder="Jane"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                <input 
                  type="text" 
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Create password</label>
              <input 
                type="password" 
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                placeholder="At least 8 characters"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}

            <div className="pt-2">
              <button 
                type="submit"
                disabled={isLoading || isGuestLoading}
                className="w-full flex justify-center items-center py-3 px-4 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:bg-indigo-400 transition-all shadow-md hover:shadow-lg group"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleGuestAuth}
              disabled={isLoading || isGuestLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              {isGuestLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
              ) : (
                <>
                  <BrainCircuit className="w-5 h-5 text-slate-500" />
                  Try ATS Scanner as Guest
                </>
              )}
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-6 text-center">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-indigo-600">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline hover:text-indigo-600">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
