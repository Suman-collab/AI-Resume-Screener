import React from 'react';

const ResumeBuilder = () => {
  return (
    <div className="w-full h-[calc(100vh-80px)] overflow-hidden">
      <iframe 
        src="https://resume-builder-eight-red.vercel.app/"
        className="w-full h-full border-0"
        title="Resume Builder"
        allowFullScreen
      />
    </div>
  );
};

export default ResumeBuilder;
