import React, { useState } from 'react';
import { CheckCircle, FileText, UploadCloud } from 'lucide-react';

const ResumeUpload = ({ onResumeSet, onFileSet }) => {
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [mode, setMode] = useState('upload');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    setFileName(file.name);
    setResumeText('');
    if (onResumeSet) onResumeSet('');
    if (onFileSet) onFileSet(file);
  };

  const handleTextChange = (e) => {
    const value = e.target.value;
    setResumeText(value);
    setFileName('');
    if (onResumeSet) onResumeSet(value);
    if (onFileSet) onFileSet(null);
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    if (nextMode === 'paste') {
      setFileName('');
      if (onFileSet) onFileSet(null);
    } else {
      setResumeText('');
      if (onResumeSet) onResumeSet('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Your Resume</h3>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'upload' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleModeChange('upload')}
          >
            Upload File
          </button>
          <button
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'paste' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleModeChange('paste')}
          >
            Paste Text
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
          <UploadCloud className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-1">Upload your resume</h4>
          <p className="text-sm text-gray-500 mb-4">Support for PDF, DOCX, and TXT files</p>
          <label className="cursor-pointer bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-block">
            Browse Files
            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} />
          </label>

          {fileName && (
            <div className="mt-4 flex items-center justify-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium text-sm">{fileName} loaded successfully!</span>
            </div>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Paste your resume text here</label>
          <textarea
            className="w-full h-48 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
            placeholder="Experience, Education, Skills..."
            value={resumeText}
            onChange={handleTextChange}
          ></textarea>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
            <FileText className="w-4 h-4" />
            Use this mode if you want to paste resume text instead of uploading a file.
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
