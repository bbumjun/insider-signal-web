'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { StockData } from '@/types';

interface InsightPanelProps {
  symbol: string;
  data: StockData;
}

function formatText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2);
      return (
        <span key={i} className="text-white font-semibold">
          {content}
        </span>
      );
    }
    return part;
  });
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
          <p className="text-slate-400 animate-pulse font-medium">Gemini가 시장 시그널을 분석 중입니다...</p>
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
            <span className="text-sm font-bold uppercase tracking-widest">분석 완료</span>
          </div>
          <div className="space-y-5 text-slate-300">
            {insight.split('\n\n').map((section, idx) => {
              const lines = section.trim().split('\n');
              const header = lines[0];
              const content = lines.slice(1);
              
              let headerColor = 'text-slate-200';
              if (header.includes('📊')) headerColor = 'text-blue-400';
              if (header.includes('📈')) headerColor = 'text-cyan-400';
              if (header.includes('🎯')) headerColor = 'text-emerald-400';
              if (header.includes('⚠️')) headerColor = 'text-amber-400';
              if (header.includes('💡')) headerColor = 'text-purple-400';
              
              return (
                <div key={idx} className="space-y-2">
                  <h3 className={`text-base font-bold ${headerColor} flex items-center gap-2`}>
                    {header}
                  </h3>
                  <div className="pl-4 space-y-1.5">
                    {content.map((line, lineIdx) => {
                      const trimmed = line.trim();
                      if (!trimmed) return null;
                      
                      if (trimmed.startsWith('•')) {
                        return (
                          <div key={lineIdx} className="flex gap-2 text-sm leading-relaxed">
                            <span className="text-slate-500 flex-shrink-0">•</span>
                            <span>{formatText(trimmed.substring(1).trim())}</span>
                          </div>
                        );
                      }
                      
                      return (
                        <p key={lineIdx} className="text-sm leading-relaxed">
                          {formatText(trimmed)}
                        </p>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pt-6 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 italic">
              AI 생성 콘텐츠는 부정확할 수 있습니다. 데이터는 매일 갱신됩니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
