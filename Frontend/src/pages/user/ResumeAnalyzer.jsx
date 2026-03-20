import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  FileText,
  Lightbulb,
  Loader2,
  Target,
  Upload,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { analyzeResumeDirectAPI } from '../../services/api';

const LIST_MARKER_REGEX = /^(\d+[\.\)]|[-*•])\s*/;
const SECTION_HEADER_REGEX = /^([A-Za-z][A-Za-z/&(),\-\s]{1,60}):\s*(.*)$/;

const toTitleCase = (value) =>
  String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const cleanText = (value) =>
  String(value || '')
    .replace(/\r/g, '')
    .replace(/â€¢/g, '•')
    .replace(/â€“|â€”/g, '-')
    .trim();

const stripCodeFence = (value) => {
  const trimmed = cleanText(value);
  const match = trimmed.match(/^```(?:json|text)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1].trim() : trimmed;
};

const stripListMarker = (value) => cleanText(value).replace(LIST_MARKER_REGEX, '').trim();

const parseMaybeJson = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = stripCodeFence(value);

  if (!trimmed || !['{', '['].includes(trimmed[0])) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
};

const splitInlineItems = (value) => {
  const normalized = cleanText(value);
  if (!normalized) return [];

  const parts = normalized
    .split(/\s*;\s+|\s+\|\s+/)
    .map(stripListMarker)
    .filter(Boolean);

  return parts.length > 1 ? parts : [];
};

const extractItemsFromText = (value) => {
  const normalized = cleanText(value);
  if (!normalized) return [];

  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return [];

  const listLikeCount = lines.filter((line) => LIST_MARKER_REGEX.test(line)).length;
  if (listLikeCount >= Math.max(1, Math.ceil(lines.length / 2))) {
    return lines.map(stripListMarker).filter(Boolean);
  }

  if (lines.length === 1) {
    return splitInlineItems(lines[0]);
  }

  return lines;
};

const normalizeSection = (title, rawValue) => {
  const parsedJson = typeof rawValue === 'string' ? parseMaybeJson(rawValue) : null;
  const value = parsedJson ?? rawValue;

  if (Array.isArray(value)) {
    const items = value
      .flatMap((entry) => {
        if (entry == null) return [];
        if (typeof entry === 'string') {
          const nestedItems = extractItemsFromText(entry);
          return nestedItems.length ? nestedItems : [cleanText(entry)];
        }
        if (typeof entry === 'object') {
          return [JSON.stringify(entry)];
        }
        return [String(entry)];
      })
      .filter(Boolean);

    return items.length ? { title, items } : null;
  }

  if (value && typeof value === 'object') {
    const sections = Object.entries(value)
      .map(([key, nestedValue]) => normalizeSection(toTitleCase(key), nestedValue))
      .filter(Boolean);

    return sections.length ? { title, sections } : null;
  }

  const text = cleanText(value);
  if (!text) return null;

  const items = extractItemsFromText(text);
  if (items.length > 1) {
    return { title, items };
  }

  return { title, text };
};

const parseSectionedText = (value) => {
  const normalized = cleanText(value);
  if (!normalized) return [];

  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const sections = [];
  let currentSection = null;

  for (const line of lines) {
    const match = line.match(SECTION_HEADER_REGEX);
    const isHeader = match && !LIST_MARKER_REGEX.test(line);

    if (isHeader) {
      currentSection = {
        title: toTitleCase(match[1]),
        chunks: match[2] ? [match[2].trim()] : [],
      };
      sections.push(currentSection);
      continue;
    }

    if (!currentSection) {
      currentSection = { title: '', chunks: [] };
      sections.push(currentSection);
    }

    currentSection.chunks.push(line);
  }

  const normalizedSections = sections
    .map((section) => normalizeSection(section.title, section.chunks.join('\n')))
    .filter(Boolean);

  return normalizedSections.length > 1 ? normalizedSections : [];
};

const normalizeContent = (content) => {
  if (content == null) return [];

  if (typeof content === 'string') {
    const parsedJson = parseMaybeJson(content);
    if (parsedJson !== null) {
      return normalizeContent(parsedJson);
    }

    const sectioned = parseSectionedText(content);
    if (sectioned.length) {
      return sectioned;
    }

    const section = normalizeSection('', content);
    return section ? [section] : [];
  }

  if (Array.isArray(content)) {
    const section = normalizeSection('', content);
    return section ? [section] : [];
  }

  if (typeof content === 'object') {
    return Object.entries(content)
      .map(([key, value]) => normalizeSection(toTitleCase(key), value))
      .filter(Boolean);
  }

  const section = normalizeSection('', String(content));
  return section ? [section] : [];
};

const ScoreRing = ({ label, score, size = 'lg', maxScore = 100, decimals = 0 }) => {
  const numericScore = Number.isFinite(Number(score)) ? Number(score) : 0;
  const clampedScore = Math.min(Math.max(numericScore, 0), maxScore);
  const pct = Math.min(Math.max(Math.round((clampedScore / maxScore) * 100), 0), 100);
  const displayValue =
    decimals > 0 ? clampedScore.toFixed(decimals).replace(/\.0+$/, '') : Math.round(clampedScore);
  const color = pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const r = size === 'lg' ? 52 : 38;
  const stroke = size === 'lg' ? 8 : 6;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const dim = r * 2 + stroke * 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${dim} ${dim}`} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={r + stroke} cy={r + stroke} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
          <circle
            cx={r + stroke}
            cy={r + stroke}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-extrabold text-gray-900" style={{ fontSize: size === 'lg' ? '1.6rem' : '1.1rem' }}>
            {displayValue}
          </span>
          <span className="text-xs font-medium text-gray-400">/ {maxScore}</span>
        </div>
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
    </div>
  );
};

const RenderSectionContent = ({ section, showTitle = false }) => {
  if (!section) return null;

  if (section.sections?.length) {
    return (
      <div className="space-y-4">
        {showTitle && section.title && <h4 className="text-sm font-bold text-gray-800">{section.title}</h4>}
        {section.sections.map((nestedSection, index) => (
          <RenderSectionContent
            key={`${nestedSection.title || 'nested-section'}-${index}`}
            section={nestedSection}
            showTitle
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showTitle && section.title && <h4 className="text-sm font-bold text-gray-800">{section.title}</h4>}

      {section.text && (
        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{section.text}</p>
      )}

      {section.items?.length > 0 && (
        <div className="space-y-2.5">
          {section.items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-gray-600 ring-1 ring-gray-200">
                {index + 1}
              </span>
              <p className="text-sm leading-relaxed text-gray-700">{item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RenderContent = ({ content }) => {
  const sections = normalizeContent(content);
  if (!sections.length) return null;

  const showTitles = sections.length > 1;
  return (
    <div className="space-y-5">
      {sections.map((section, index) => (
        <RenderSectionContent
          key={`${section.title || 'section'}-${index}`}
          section={section}
          showTitle={showTitles}
        />
      ))}
    </div>
  );
};

const ResultSection = ({ icon: Icon, title, subtitle, content, accentColor }) => {
  const colors = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      badge: 'bg-green-100 text-green-700',
      heading: 'text-green-800',
      dot: 'bg-green-500',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-600',
      badge: 'bg-amber-100 text-amber-700',
      heading: 'text-amber-800',
      dot: 'bg-amber-500',
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      icon: 'text-indigo-600',
      badge: 'bg-indigo-100 text-indigo-700',
      heading: 'text-indigo-800',
      dot: 'bg-indigo-500',
    },
  };
  const c = colors[accentColor];

  return (
    <div className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${c.border}`}>
      <div className={`${c.bg} flex items-center gap-4 border-b px-6 py-4 ${c.border}`}>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.badge}`}>
          <Icon className={`h-5 w-5 ${c.icon}`} />
        </div>
        <div>
          <h3 className={`text-base font-bold ${c.heading}`}>{title}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className={`ml-auto h-10 w-2 rounded-full ${c.dot}`} />
      </div>
      <div className="px-6 py-5">
        <RenderContent content={content} />
      </div>
    </div>
  );
};

const ResumeAnalyzer = () => {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) setResumeFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) setResumeFile(file);
  };

  const handleAnalyze = async () => {
    if (!jobDescription || !resumeFile) {
      alert('Please provide both a job description and a resume file.');
      return;
    }

    setIsAnalyzing(true);
    setResults(null);
    setError('');

    try {
      const response = await analyzeResumeDirectAPI(resumeFile, jobDescription);
      setResults(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to analyze resume. Please ensure the AI server is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen px-2 py-2 sm:px-3 sm:py-3">
      <div className="mx-auto max-w-[1600px] pb-8">
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-gray-500 shadow-sm ring-1 ring-slate-200/70 backdrop-blur-sm transition-colors hover:text-indigo-600"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Resume AI Analyzer</h1>
          </div>
          <p className="text-sm text-gray-500">
            Upload your resume and paste a job description to get an AI-powered ATS score.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.6fr)]">
          <div className="flex flex-col space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <label className="mb-2 block text-sm font-bold text-gray-700">Job Description</label>
              <textarea
                className="h-40 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3.5 text-sm text-gray-700 outline-none transition-all focus:ring-2 focus:ring-indigo-400"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
              />
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Resume File <span className="font-normal text-gray-400">(PDF, DOCX, TXT)</span>
              </label>

              {resumeFile ? (
                <div className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
                  <FileText className="h-5 w-5 shrink-0 text-indigo-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-indigo-800">{resumeFile.name}</p>
                    <p className="text-xs text-indigo-400">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    onClick={() => setResumeFile(null)}
                    className="text-indigo-300 transition-colors hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={(event) => event.preventDefault()}
                  onClick={() => document.getElementById('resume-input').click()}
                  className="cursor-pointer rounded-xl border-2 border-dashed border-gray-200 p-7 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50/30"
                >
                  <Upload className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  <p className="text-sm font-medium text-gray-600">Drag and drop or click to upload</p>
                  <p className="mt-1 text-xs text-gray-400">PDF, DOCX, or TXT</p>
                  <input
                    id="resume-input"
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!jobDescription || !resumeFile || isAnalyzing}
              className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-200"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Analyzing with AI...
                </>
              ) : (
                'Analyze My Resume'
              )}
            </button>
          </div>

          <div className="flex min-h-[450px] flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            {!results && !isAnalyzing && (
              <div className="text-center text-gray-400">
                <Target className="mx-auto mb-3 h-12 w-12 text-gray-200" />
                <p className="text-sm font-semibold text-gray-600">Your score will appear here</p>
                <p className="mt-1 text-xs">Fill in the inputs and click Analyze</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-indigo-400" />
                <p className="font-bold text-gray-700">AI is evaluating your resume...</p>
                <p className="mt-2 text-xs text-gray-400">This usually takes 30-60 seconds</p>
              </div>
            )}

            {results && !isAnalyzing && (
              <div className="w-full text-center">
                <div className="mb-5 flex items-center justify-around">
                  <ScoreRing label="ATS Score" score={results.ats_score} size="lg" maxScore={100} decimals={0} />
                  {results.overall_score !== undefined && (
                    <ScoreRing
                      label="Overall Score"
                      score={results.overall_score}
                      size="sm"
                      maxScore={10}
                      decimals={1}
                    />
                  )}
                </div>
                <div
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
                    (results.ats_score ?? 0) >= 75
                      ? 'bg-green-50 text-green-700'
                      : (results.ats_score ?? 0) >= 50
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-red-50 text-red-700'
                  }`}
                >
                  {(results.ats_score ?? 0) >= 75
                    ? 'Strong match. Great candidate profile.'
                    : (results.ats_score ?? 0) >= 50
                      ? 'Good start. Review the suggestions below.'
                      : 'Significant gaps found. Focus on the improvements below.'}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {results && !isAnalyzing && (
          <div className="space-y-5">
            {results.skill_requirements && (
              <ResultSection
                icon={CheckCircle}
                title="Skill Requirements"
                subtitle="Required technical, soft, and domain skills extracted from the job description"
                content={results.skill_requirements}
                accentColor="green"
              />
            )}

            {results.weaknesses_and_suggestions && (
              <ResultSection
                icon={AlertTriangle}
                title="Weaknesses and Suggestions"
                subtitle="Gaps found in your resume compared to the job requirements, with actionable advice"
                content={results.weaknesses_and_suggestions}
                accentColor="amber"
              />
            )}

            {results.improvements && (
              <ResultSection
                icon={Lightbulb}
                title="Improvement Suggestions"
                subtitle="Specific, actionable ways to improve your resume for this role"
                content={results.improvements}
                accentColor="indigo"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
