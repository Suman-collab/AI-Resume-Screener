import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Loader2 } from 'lucide-react';
import ATSScoreCard from '../../components/ATSScoreCard';
import ResumeAnalysisReport from '../../components/ResumeAnalysisReport';
import { getUserApplicationByIdAPI } from '../../services/api';

const ScoreReport = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await getUserApplicationByIdAPI(applicationId);
        setReportData(response.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load report.');
      }
    };

    fetchReport();
  }, [applicationId]);

  if (!reportData) {
    return (
      <div className="text-center p-8">
        {error ? <span className="text-red-600">{error}</span> : <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Applications
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Report</h1>
        <div className="flex items-center text-gray-600 gap-4 mt-2">
          <div className="font-medium text-gray-800">
            Role: {reportData.jobId?.title || 'Unknown Job'}
          </div>
          <div className="flex items-center gap-1.5 font-medium text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md">
            <Building2 className="w-4 h-4" /> {reportData.jobId?.company || 'Company'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="sticky top-8">
            <ATSScoreCard score={reportData.atsScore} />
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-4">Detailed Analysis</h3>
            <ResumeAnalysisReport report={reportData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreReport;
