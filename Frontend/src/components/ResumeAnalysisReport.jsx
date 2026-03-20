import React from 'react';
import { ThumbsUp, AlertCircle, Wrench } from 'lucide-react';

const ResumeAnalysisReport = ({ report }) => {
  if (!report) return null;

  return (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-xl p-6 border border-green-100">
        <h3 className="flex items-center gap-2 text-lg font-bold text-green-900 mb-4">
          <ThumbsUp className="w-5 h-5 text-green-600" />
          Strengths
        </h3>
        <ul className="space-y-2">
          {report.strengths?.map((strength, index) => (
            <li key={index} className="flex items-start gap-2 text-green-800">
              <span className="text-green-500 mt-1">•</span>
              <span>{strength}</span>
            </li>
          )) || <li className="text-gray-500 italic">No strengths listed.</li>}
        </ul>
      </div>

      <div className="bg-red-50 rounded-xl p-6 border border-red-100">
        <h3 className="flex items-center gap-2 text-lg font-bold text-red-900 mb-4">
          <AlertCircle className="w-5 h-5 text-red-600" />
          Weaknesses & Missing Skills
        </h3>
        <ul className="space-y-2">
          {report.weaknesses?.map((weakness, index) => (
            <li key={index} className="flex items-start gap-2 text-red-800">
              <span className="text-red-500 mt-1">•</span>
              <span>{weakness}</span>
            </li>
          )) || <li className="text-gray-500 italic">No weaknesses found.</li>}
        </ul>
      </div>

      <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
        <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-900 mb-4">
          <Wrench className="w-5 h-5 text-indigo-600" />
          Required Tech Stack Match
        </h3>
        <div className="flex flex-wrap gap-2">
          {report.techStack?.map((tech, index) => (
            <span key={index} className="bg-white border border-indigo-200 text-indigo-700 font-medium px-3 py-1 rounded-full text-sm shadow-sm">
              {tech}
            </span>
          )) || <p className="text-gray-500 italic">No required tech stack listed.</p>}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysisReport;
