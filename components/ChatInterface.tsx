
import React, { useState } from 'react';
import { gemini } from '../services/gemini';

const ChatInterface: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string, sources?: any[]}[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setQuery('');
    setIsTyping(true);

    try {
      // Use Search Grounding for context-aware queries
      const { text, sources } = await gemini.searchClinicalContext(userMsg);
      setMessages(prev => [...prev, { role: 'ai', content: text, sources }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "I encountered an error while searching for that information." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen ? (
        <div className="bg-white w-[400px] h-[500px] rounded-3xl shadow-2xl border flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="p-6 border-b flex justify-between items-center bg-blue-600 text-white rounded-t-3xl">
            <div className="flex items-center space-x-2">
               <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
               <span className="font-bold text-sm uppercase tracking-widest">Intelligence Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-500 p-1 rounded transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12 px-8">
                 <p className="text-slate-400 text-sm">Ask about trial enrollment, site risks, or search current clinical trends.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                   {m.content}
                   {m.sources && m.sources.length > 0 && (
                     <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Sources</p>
                        {m.sources.map((s, idx) => (
                          <a key={idx} href={s.web?.uri} target="_blank" rel="noreferrer" className="block text-[10px] text-blue-600 hover:underline truncate">
                             {s.web?.title || s.web?.uri}
                          </a>
                        ))}
                     </div>
                   )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none text-slate-400">
                   <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{animationDelay:'200ms'}}></div>
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{animationDelay:'400ms'}}></div>
                   </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border-t rounded-b-3xl">
            <div className="relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask clinical intelligence..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group flex items-center"
        >
          <span className="w-0 group-hover:w-32 overflow-hidden transition-all duration-300 font-bold uppercase text-xs tracking-widest whitespace-nowrap">Ask Intelligence</span>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        </button>
      )}
    </div>
  );
};

export default ChatInterface;
