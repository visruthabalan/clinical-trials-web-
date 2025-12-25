
import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

const VoiceAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);

  const startSession = async () => {
    setIsActive(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    // Set up audio contexts
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    audioContextRef.current = outputCtx;

    let nextStartTime = 0;
    const sources = new Set<AudioBufferSourceNode>();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          const source = inputCtx.createMediaStreamSource(stream);
          const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            
            const binary = String.fromCharCode(...new Uint8Array(int16.buffer));
            const base64 = btoa(binary);

            sessionPromise.then(session => {
              session.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
            });
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputCtx.destination);
        },
        onmessage: async (msg) => {
          const base64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64) {
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
            
            const dataInt16 = new Int16Array(bytes.buffer);
            const buffer = outputCtx.createBuffer(1, dataInt16.length, 24000);
            const channelData = buffer.getChannelData(0);
            for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

            const source = outputCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(outputCtx.destination);
            nextStartTime = Math.max(nextStartTime, outputCtx.currentTime);
            source.start(nextStartTime);
            nextStartTime += buffer.duration;
            sources.add(source);
          }
        },
        onerror: (e) => console.error("Live Error", e),
        onclose: () => setIsActive(false)
      },
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: "You are a conversational clinical trial operational expert. Help the user navigate trial data naturally."
      }
    });

    sessionRef.current = await sessionPromise;
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsActive(false);
  };

  return (
    <div className="flex flex-col items-center">
      <button 
        onClick={isActive ? stopSession : startSession}
        className={`w-full py-4 rounded-xl flex items-center justify-center space-x-3 transition-all ${
          isActive ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-slate-800 hover:bg-slate-700'
        } shadow-lg`}
      >
        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-blue-500'}`}></div>
        <span className="text-sm font-bold uppercase tracking-widest">{isActive ? 'Voice Live' : 'Voice Connect'}</span>
      </button>
      {isActive && <p className="text-[10px] text-rose-300 mt-2 font-black uppercase animate-pulse">Live Audio Active</p>}
    </div>
  );
};

export default VoiceAssistant;
