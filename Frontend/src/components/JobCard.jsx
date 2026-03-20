import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock } from 'lucide-react';

const JobCard = ({ job, role = 'user' }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
          <p className="text-indigo-600 font-medium">{job.company}</p>
        </div>
        <span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
          Active
        </span>
      </div>
      
      <div className="flex flex-col gap-2 mb-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>Remote / Flexible</span>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          <span>{job.requiredSkills?.join(', ') || 'Skills not specified'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Posted recently</span>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        {role === 'user' ? (
          <Link 
            to={`/user/apply/${job._id}`}
            className="w-full text-center bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Apply Now
          </Link>
        ) : (
          <Link 
            to={`/hr/applicants/${job._id}`}
            className="w-full text-center bg-white text-indigo-600 border border-indigo-600 py-2 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
          >
            View Applicants
          </Link>
        )}
      </div>
    </div>
  );
};

export default JobCard;
