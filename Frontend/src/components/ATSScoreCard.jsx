import React from 'react';
import { Target } from 'lucide-react';

const ATSScoreCard = ({ score }) => {
  // Determine color based on score
  let colorClass = 'text-red-500';
  let bgClass = 'bg-red-50';
  let borderClass = 'border-red-200';
  
  if (score >= 75) {
    colorClass = 'text-green-500';
    bgClass = 'bg-green-50';
    borderClass = 'border-green-200';
  } else if (score >= 50) {
    colorClass = 'text-yellow-500';
    bgClass = 'bg-yellow-50';
    borderClass = 'border-yellow-200';
  }

  return (
    <div className={`rounded-xl p-8 border ${borderClass} ${bgClass} flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden`}>
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Target className={`w-32 h-32 ${colorClass}`} />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2 relative z-10">ATS Match Score</h3>
      <div className={`text-6xl font-black ${colorClass} pt-4 pb-2 relative z-10 tracking-tighter`}>
        {score}%
      </div>
      <p className="text-sm font-medium text-gray-600 mt-2 relative z-10">
        {score >= 75 ? 'Excellent match! You are highly recommended.' : 
         score >= 50 ? 'Good match, but room for improvement.' : 
         'Low match. Consider adding more keywords.'}
      </p>
    </div>
  );
};

export default ATSScoreCard;
