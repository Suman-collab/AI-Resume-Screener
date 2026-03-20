import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HRSidebar from '../../components/HRSidebar';
import { createJobAPI } from '../../services/api';
import { Loader2 } from 'lucide-react';

const CreateJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requiredSkills: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    // Process tags
    const skillsArray = formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
    
    try {
      await createJobAPI({
        ...formData,
        requiredSkills: skillsArray
      });
      navigate('/hr/manage-jobs');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create job');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-8 max-w-7xl mx-auto pb-12">
      <HRSidebar />
      
      <div className="flex-1 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Job Posting</h1>
        <p className="text-gray-600 mb-8">Fill out the details below to post a new opening.</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
              <input 
                type="text" 
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                placeholder="e.g. Senior React Developer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input 
                type="text" 
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                placeholder="e.g. TechCorp Plus"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills <span className="text-gray-400 font-normal">(Comma separated)</span>
            </label>
            <input 
              type="text" 
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              placeholder="React, TypeScript, Node.js, API Design"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
            <p className="mb-3 text-sm text-gray-500">
              Use short paragraphs or bullet points for responsibilities, requirements, and benefits so the posting is easier to read.
            </p>
            <textarea 
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows="8"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none"
              placeholder="Describe the responsibilities, requirements, and benefits..."
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2 flex items-center gap-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 font-medium shadow-md transition-all"
            >
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</> : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;
