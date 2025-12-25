
import React, { useState, useEffect } from 'react';
import { TrialSite } from '../types';
import { gemini } from '../services/gemini';

interface SiteDeepDiveProps {
  site: TrialSite;
  onBack: () => void;
}

const SiteDeepDive: React.FC<SiteDeepDiveProps> = ({ site, onBack }) => {
  const [summary, setSummary] = useState<string>('Generating site narrative...');
  const [isSummarizing, setIsSummarizing] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsSummarizing(true);
      const prompt = `Provide a concise clinical trial performance summary for Site ${site.name} (${site.id}). 
      Data: Enrollment Rate ${site.enrollmentRate}, Screen Fail ${site.screenFailRate}%, Queries ${site.openQueries}, Deviations ${site.protocolDeviations}. 
      Status: ${site.status}. Note risks and suggest 3 focus items for the next CRA visit.`;
      const res = await gemini.getComplexInsight(prompt);
      setSummary(res);
      setIsSummarizing(false);
    };
    fetchSummary();
  }, [site]);

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <button onClick={onBack} className="text-slate-500 hover:text-slate-800 flex items-center text-sm font-medium mb-4">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Dashboard
      </button>

      <div className="flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{site.name}</h1>
          <p className="text-slate-500 flex items-center mt-1">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {site.location}
          </p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Generate Agenda</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-all">Schedule Monitoring</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Metrics Grid */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
             <div className="flex justify-between items-center mb-4">
                <span className="text-xs uppercase tracking-widest font-bold text-slate-400">Risk Profile</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${site.riskScore > 50 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                  {site.riskScore > 50 ? 'Critical' : 'Controlled'}
                </span>
             </div>
             <div className="text-5xl font-black mb-2">{site.riskScore}</div>
             <div className="w-full bg-slate-800 rounded-full h-2 mb-4">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${site.riskScore}%` }}></div>
             </div>
             <p className="text-sm text-slate-400">Probability of non-compliance based on query aging and deviation trends.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Enrollment</p>
              <p className="text-xl font-bold">{site.enrollmentRate}/mo</p>
            </div>
            <div className="bg-white p-4 rounded-xl border">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Screen Fail</p>
              <p className="text-xl font-bold">{site.screenFailRate}%</p>
            </div>
            <div className="bg-white p-4 rounded-xl border">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Deviations</p>
              <p className="text-xl font-bold">{site.protocolDeviations}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Last Visit</p>
              <p className="text-sm font-bold">{site.lastMonitorVisit}</p>
            </div>
          </div>
        </div>

        {/* Right Column: AI Narrative */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-2xl border shadow-sm p-8 h-full">
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                   <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800">Agentic Insight Report</h3>
              </div>

              {isSummarizing ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                </div>
              ) : (
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {summary}
                </div>
              )}

              {!isSummarizing && (
                <div className="mt-8 pt-8 border-t flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    <span>Insights generated by Gemini 3.0 Thinking Engine • 94% Confidence</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    </button>
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    </button>
                  </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SiteDeepDive;
