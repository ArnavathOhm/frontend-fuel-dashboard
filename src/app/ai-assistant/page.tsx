"use client";

import React, { useState } from 'react';
import { Send, Bot, User, Paperclip, Loader2 } from 'lucide-react';

export default function AIChatbot() {
  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestions = [
    "Why is EX0389 burning 15% more fuel than baseline?",
    "Show me the queueing times for the last 4 hours.",
    "Calculate the financial cost of 20% increased idle time today."
  ];

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) throw new Error('Failed to fetch AI response');

      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: data.response 
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "Sorry, I'm having trouble connecting to my brain right now. Please try again later." 
      }]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
      
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-border bg-gray-50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-lg">PetroSee Intelligence</h2>
          <p className="text-xs text-status-priority font-medium">Online & Ready</p>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Bot className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="font-bold text-gray-500 mb-2">Query FMS Metrics Naturally</h3>
            <p className="text-sm text-gray-400 max-w-sm mb-8">Ask standard logistical questions and PetroSee Intelligence will query the dataset to find correlations instantly.</p>
            <div className="flex flex-col gap-2 w-full max-w-md">
              {suggestions.map((text, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSend(text)}
                  className="px-4 py-3 text-sm text-left bg-surface border border-border rounded-xl hover:border-secondary hover:text-secondary transition-colors font-medium text-gray-700"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0 mt-1">
                  <Bot className="w-5 h-5" />
                </div>
              )}
              <div className={`px-5 py-3 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-background rounded-tr-sm' : 'bg-surface border border-border shadow-sm rounded-tl-sm text-gray-700'}`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 shrink-0 mt-1">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))
        )}
        {loading && (
          <div className="flex gap-4 justify-start">
             <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0 mt-1">
                <Bot className="w-5 h-5" />
             </div>
             <div className="px-5 py-4 rounded-2xl bg-surface border border-border shadow-sm rounded-tl-sm text-gray-700 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-secondary" />
                <span className="text-sm font-medium text-gray-500">Querying FMS dataset...</span>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-surface border-t border-border">
        <div className="flex items-end gap-2 bg-background border border-border rounded-xl p-2 focus-within:ring-1 focus-within:ring-secondary focus-within:border-secondary transition-all">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); } }}
            placeholder="Message PetroSee Intelligence..."
            className="flex-1 max-h-32 bg-transparent resize-none focus:outline-none py-2 text-sm"
            rows={1}
          />
          <button 
            onClick={() => handleSend(input)}
            disabled={!input.trim() || loading}
            className="p-2 bg-secondary text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-2">AI can make mistakes. Verify critical correlations with the Optimization module.</p>
      </div>
    </div>
  );
}
