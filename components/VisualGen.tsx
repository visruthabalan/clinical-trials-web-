
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

const VisualGen: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [type, setType] = useState<'image' | 'video'>('image');
  const [aspectRatio, setAspectRatio] = useState('16:9');

  const generateImage = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: { aspectRatio: aspectRatio as any, imageSize: "1K" }
        }
      });
      
      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        setResultUrl(`data:image/png;base64,${part.inlineData.data}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVideo = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      let op = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: { resolution: '720p', aspectRatio: aspectRatio as any }
      });
      
      while (!op.done) {
        await new Promise(r => setTimeout(r, 5000));
        op = await ai.operations.getVideosOperation({ operation: op });
      }

      const uri = op.response?.generatedVideos?.[0]?.video?.uri;
      if (uri) {
        const resp = await fetch(`${uri}&key=${process.env.API_KEY}`);
        const blob = await resp.blob();
        setResultUrl(URL.createObjectURL(blob));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-3xl border shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Protocol Visual Asset Factory</h2>
        
        <div className="flex space-x-4 mb-6">
           {['image', 'video'].map((t) => (
             <button 
              key={t}
              onClick={() => { setType(t as any); setResultUrl(null); }}
              className={`px-6 py-2 rounded-full text-sm font-bold uppercase transition-all ${type === t ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}
             >
               Generate {t}
             </button>
           ))}
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-700 uppercase">Description</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-slate-50 border p-4 rounded-xl min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder={`Describe the clinical ${type} (e.g., "A medical diagram showing patient enrollment funnel in a futuristic clinic" or "A professional explainer animation about insulin trial protocol")...`}
          />
          
          <div className="flex flex-wrap gap-4 items-end">
             <div className="flex-1 min-w-[200px]">
               <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Aspect Ratio</label>
               <select 
                value={aspectRatio} 
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full bg-slate-50 border p-2 rounded-lg text-sm"
               >
                 <option value="16:9">16:9 Landscape</option>
                 <option value="9:16">9:16 Portrait</option>
                 <option value="1:1">1:1 Square</option>
                 <option value="4:3">4:3 Standard</option>
               </select>
             </div>
             
             <button 
              onClick={type === 'image' ? generateImage : generateVideo}
              disabled={isGenerating || !prompt}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl"
             >
               {isGenerating ? 'Processing...' : `Generate ${type}`}
             </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-100 min-h-[400px] rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative">
        {isGenerating && (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">{type === 'video' ? 'Veo is dreaming your sequence (approx 60s)...' : 'Imagining your asset...'}</p>
          </div>
        )}
        
        {!isGenerating && resultUrl && (
          type === 'image' ? (
            <img src={resultUrl} alt="Generated" className="max-w-full max-h-full object-contain" />
          ) : (
            <video src={resultUrl} controls className="max-w-full max-h-full" />
          )
        )}
        
        {!isGenerating && !resultUrl && (
          <div className="text-center p-12">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p className="text-slate-400">Enter a prompt above to generate medical visuals.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualGen;
