import { Link } from 'react-router-dom';
import { ArrowLeft, BrainCircuit } from 'lucide-react';

const LegalDocument = ({ title, subtitle, lastUpdated, sections }) => {
  return (
    <div className="max-w-4xl mx-auto pb-16">
      <div className="mb-8">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-500 px-8 py-10 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-100">
              ATS Analyzer
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className="text-indigo-100 max-w-2xl">{subtitle}</p>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-200 mt-4">
            Last updated {lastUpdated}
          </p>
        </div>

        <div className="px-8 py-8 space-y-8">
          {sections.map((section) => (
            <section key={section.heading} className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-7 text-gray-600">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <div className="pt-4 border-t border-gray-100 text-sm text-gray-500">
            Questions about this document? Contact the ATS Analyzer team before continuing to use the platform.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalDocument;
