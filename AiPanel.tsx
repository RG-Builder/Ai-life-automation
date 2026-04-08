import React, { useState } from 'react';
import { Brain, Sparkles, X, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

interface AiPanelProps {
  onClose: () => void;
  missions: any[];
  consistencySystem: any[];
  userProfile: any;
}

export const AiPanel: React.FC<AiPanelProps> = ({ onClose, missions, consistencySystem, userProfile }) => {
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const askAi = async () => {
    if (!query.trim()) return;
    const userMsg = query;
    setQuery('');
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsGenerating(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('Gemini API key not configured');

      const ai = new GoogleGenAI({ apiKey });
      const context = JSON.stringify({ missions: missions.slice(0, 10), consistencySystem, userProfile });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `You are an AI Life Architect helping someone optimize their productivity and life.
User Query: ${userMsg}
User Context: ${context}
Provide a concise, actionable, and encouraging response. Keep it under 150 words.`,
      });
      setChat(prev => [...prev, { role: 'ai', text: response.text || "I'm processing your request." }]);
    } catch (err) {
      setChat(prev => [...prev, { role: 'ai', text: 'Neural link interrupted. Please check your API key and try again.' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestions = [
    "What should I focus on today?",
    "How can I improve my productivity?",
    "Help me break down my biggest task",
  ];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-y-0 right-0 w-full max-w-md bg-background border-l border-border z-[150] shadow-2xl flex flex-col"
    >
      <div className="p-6 border-b border-border flex items-center justify-between bg-surface">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Brain size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tighter text-text_primary">AI Architect</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Neural Sync Active</p>
          </div>
        </div>
        <button onClick={onClose} className="text-text_secondary hover:text-text_primary transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {chat.length === 0 && (
          <div className="space-y-6">
            <div className="text-center py-8 space-y-4">
              <Sparkles size={48} className="mx-auto text-primary opacity-20" />
              <p className="text-text_secondary font-bold text-sm italic">"How can I optimize your performance today?"</p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-text_secondary">Quick prompts</p>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setQuery(s); }}
                  className="w-full text-left p-3 rounded-xl bg-surface border border-border text-sm font-medium text-text_secondary hover:text-text_primary hover:border-primary/30 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {chat.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl font-medium text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-black' : 'bg-surface border border-border text-text_primary'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-surface border border-border p-4 rounded-2xl flex gap-1">
              <div className="size-1.5 bg-primary rounded-full animate-bounce" />
              <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-border bg-surface">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isGenerating && askAi()}
            placeholder="Ask your AI Architect..."
            className="w-full bg-background border border-border rounded-xl px-4 py-4 pr-12 outline-none focus:border-primary transition-all font-bold text-text_primary"
          />
          <button
            onClick={askAi}
            disabled={isGenerating || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 size-10 bg-primary text-black rounded-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
