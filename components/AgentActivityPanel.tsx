
import React from 'react';
import { AgentInsight } from '../types';

interface AgentActivityPanelProps {
  insights: AgentInsight[];
  isLoading: boolean;
}

const AgentActivityPanel: React.FC<AgentActivityPanelProps> = ({ insights, isLoading }) => {
  return (
    <div className="w-96 bg-white border-l flex flex-col h-full animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b flex justify-between items-center bg-slate-50">
        <div>
          <h3 className="font-bold text-slate-800">Agent Intelligence</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Automated Detection Feed</p>
        </div>
        {isLoading && (
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {insights.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-8">
            <div className="p-4 bg-slate-50 rounded-full mb-4">
               <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <p className="text-sm font-medium text-slate-400">Agents are analyzing data patterns. Real-time insights will appear here.</p>
          </div>
        ) : (
          insights.map((insight) => (
            <div key={insight.id} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
               <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                  insight.severity === 'critical' ? 'bg-rose-500' : 
                  insight.severity === 'high' ? 'bg-amber-500' : 
                  'bg-blue-500'
               }`}></div>
               
               <div className="flex justify-between items-start mb-2">
                 <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                   {insight.agentName}
                 </span>
                 <span className="text-[10px] text-slate-400">
                    {new Date(insight.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </span>
               </div>
               
               <h4 className="font-bold text-sm text-slate-800 mb-1 leading-snug">{insight.title}</h4>
               <p className="text-xs text-slate-500 line-clamp-2 mb-3">{insight.description}</p>
               
               <div className="bg-slate-50 p-2 rounded text-[11px] font-medium text-slate-700 border border-slate-100 italic">
                 <span className="text-blue-600 font-bold uppercase text-[9px] block mb-1">Proposed Action:</span>
                 {insight.suggestedAction}
               </div>

               <div className="mt-3 flex justify-end">
                 <button className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-wider">Execute Action →</button>
               </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t">
         <button className="w-full py-2 bg-white border rounded-lg text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm transition-all uppercase tracking-widest">
           View Audit Trail
         </button>
      </div>
    </div>
  );
};

export default AgentActivityPanel;
