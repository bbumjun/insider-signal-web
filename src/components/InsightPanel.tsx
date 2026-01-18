'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { StockData } from '@/types';

interface InsightPanelProps {
  symbol: string;
  data: StockData;
}

export default function InsightPanel({ symbol, data }: InsightPanelProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsight = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/stock/${symbol}/analysis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        setInsight(result.insight);
      } catch (err) {
        console.error('AI Insight Error:', err);
        setError('Failed to generate AI analysis. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
  }, [symbol, data]);

  return (
    <div className="h-full flex flex-col">
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-slate-400 animate-pulse font-medium">Gemini is analyzing market signals...</p>
        </div>
      )}

      {error && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      )}

      {insight && !loading && (
        <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-2 text-emerald-500">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Analysis Complete</span>
          </div>
          <div className="prose prose-invert max-w-none text-slate-300">
            <div className="whitespace-pre-wrap leading-relaxed">
              {insight}
            </div>
          </div>
          <div className="pt-6 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 italic">
              AI-generated content may be inaccurate. Data is refreshed daily.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
