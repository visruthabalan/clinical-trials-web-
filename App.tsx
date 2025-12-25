
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ClinicalData, AgentInsight, AgentType, TrialSite } from './types';
import { MOCK_CLINICAL_DATA } from './data/mockData';
import { ICONS, COLORS } from './constants';
import Dashboard from './components/Dashboard';
import SiteDeepDive from './components/SiteDeepDive';
import AgentActivityPanel from './components/AgentActivityPanel';
import ChatInterface from './components/ChatInterface';
import VoiceAssistant from './components/VoiceAssistant';
import VisualGen from './components/VisualGen';
import { gemini } from './services/gemini';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sites' | 'visuals'>('dashboard');
  const [clinicalData, setClinicalData] = useState<ClinicalData>(MOCK_CLINICAL_DATA);
  const [selectedSite, setSelectedSite] = useState<TrialSite | null>(null);
  const [agentInsights, setAgentInsights] = useState<AgentInsight[]>([]);
  const [isAgentRunning, setIsAgentRunning] = useState(false);

  // Simulate real-time data flow
  useEffect(() => {
    const interval = setInterval(() => {
      setClinicalData(prev => {
        const updatedSites = prev.sites.map(site => ({
          ...site,
          enrollmentRate: +(site.enrollmentRate + (Math.random() * 0.1 - 0.05)).toFixed(2),
          openQueries: Math.max(0, site.openQueries + Math.floor(Math.random() * 3 - 1)),
          riskScore: Math.min(100, Math.max(0, site.riskScore + (Math.random() * 2 - 1)))
        }));
        return {
          ...prev,
          sites: updatedSites,
          totalQueries: updatedSites.reduce((acc, s) => acc + s.openQueries, 0),
          lastUpdated: new Date().toISOString()
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Run Agents Periodically
  const runAgents = useCallback(async () => {
    if (isAgentRunning) return;
    setIsAgentRunning(true);
    try {
      const types = [AgentType.DATA_QUALITY, AgentType.OPERATIONAL_RISK];
      const allNewInsights: AgentInsight[] = [];
      
      for (const type of types) {
        const insights = await gemini.runAgentAnalysis(type, clinicalData);
        allNewInsights.push(...insights);
      }
      
      setAgentInsights(prev => [...allNewInsights, ...prev].slice(0, 50));
    } finally {
      setIsAgentRunning(false);
    }
  }, [clinicalData, isAgentRunning]);

  useEffect(() => {
    const timeout = setTimeout(runAgents, 1000); // Run once on start
    const interval = setInterval(runAgents, 30000); // Every 30s
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight text-blue-400">ClinicalIQ</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Insight Platform</p>
        </div>
        
        <nav className="flex-1 mt-4 px-4 space-y-2">
          <button 
            onClick={() => { setActiveTab('dashboard'); setSelectedSite(null); }}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <ICONS.Dashboard className="w-5 h-5 mr-3" />
            <span className="font-medium">Trial Dashboard</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('sites')}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'sites' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <ICONS.Site className="w-5 h-5 mr-3" />
            <span className="font-medium">Site Analytics</span>
          </button>

          <button 
            onClick={() => setActiveTab('visuals')}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'visuals' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
          >
             <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="font-medium">Visual Assets</span>
          </button>
        </nav>

        <div className="p-6 border-t border-slate-800">
           <VoiceAssistant />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-white flex items-center justify-between px-8 z-10">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-slate-800">
              {selectedSite ? `Site: ${selectedSite.name}` : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            <div className="flex items-center bg-slate-100 rounded-full px-3 py-1 text-xs text-slate-500">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Live Feed
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-xs text-slate-500">Last Synced</p>
              <p className="text-sm font-medium">{new Date(clinicalData.lastUpdated).toLocaleTimeString()}</p>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-8 flex gap-8">
          <div className="flex-1 space-y-8">
            {activeTab === 'dashboard' && !selectedSite && (
              <Dashboard 
                data={clinicalData} 
                onSiteSelect={(site) => { setActiveTab('sites'); setSelectedSite(site); }}
              />
            )}
            {activeTab === 'sites' && selectedSite && (
              <SiteDeepDive 
                site={selectedSite} 
                onBack={() => { setSelectedSite(null); setActiveTab('dashboard'); }} 
              />
            )}
            {activeTab === 'sites' && !selectedSite && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {clinicalData.sites.map(site => (
                   <div 
                    key={site.id} 
                    onClick={() => setSelectedSite(site)}
                    className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                     <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-slate-800 group-hover:text-blue-600">{site.name}</h3>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${site.status === 'At Risk' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {site.status}
                        </span>
                     </div>
                     <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Risk Score</span><span className="font-semibold">{site.riskScore}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Open Queries</span><span className="font-semibold">{site.openQueries}</span></div>
                     </div>
                   </div>
                 ))}
               </div>
            )}
            {activeTab === 'visuals' && <VisualGen />}
          </div>

          {/* Right Sidebar: Agent Activity */}
          <AgentActivityPanel insights={agentInsights} isLoading={isAgentRunning} />
        </div>

        {/* Global Chat / Query Interface */}
        <ChatInterface />
      </main>
    </div>
  );
};

export default App;
