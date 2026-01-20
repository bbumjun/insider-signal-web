'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { StockData } from '@/types';

interface InsightPanelProps {
  symbol: string;
  data: StockData;
}

interface SignalData {
  buy: number;
  sell: number;
}

function parseSignalData(insight: string): SignalData | null {
  const match = insight.match(/<!--SIGNAL:(\{.*?\})-->/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function SignalGauge({ value, type }: { value: number; type: 'buy' | 'sell' }) {
  const [animated, setAnimated] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const clampedValue = Math.max(1, Math.min(5, value));
  const percentage = ((clampedValue - 1) / 4) * 100;
  const rotation = animated ? (percentage / 100) * 180 - 90 : -90;
  
  const isBuy = type === 'buy';
  const gradientColors = isBuy 
    ? 'from-emerald-500 to-emerald-400' 
    : 'from-red-500 to-amber-500';
  const accentColor = isBuy ? 'bg-emerald-500' : 'bg-red-500';
  const textColor = isBuy ? 'text-emerald-400' : 'text-red-400';
  const label = isBuy ? '매수 시그널' : '매도 시그널';
  const Icon = isBuy ? TrendingUp : TrendingDown;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-14 sm:w-32 sm:h-[68px]">
        <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 overflow-hidden">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-[6px] sm:border-8 border-slate-700/50" />
        </div>
        <div 
          className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 overflow-hidden"
          style={{
            clipPath: `polygon(0 100%, 0 0, ${percentage}% 0, ${percentage}% 100%)`,
          }}
        >
          <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full border-[6px] sm:border-8 border-transparent bg-gradient-to-r ${gradientColors} [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:exclude]`} 
            style={{ padding: '6px' }}
          />
        </div>
        <div 
          className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-1000 ease-out"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        >
          <div className="flex flex-col items-center">
            <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${accentColor} shadow-lg`} />
            <div className={`w-0.5 h-8 sm:h-11 ${accentColor} opacity-60`} />
          </div>
        </div>
        <div className="absolute -bottom-1 left-0 text-[10px] text-slate-500">1</div>
        <div className="absolute -bottom-1 right-0 text-[10px] text-slate-500">5</div>
      </div>
      <div className={`mt-1 text-xl sm:text-2xl font-bold ${textColor}`}>{clampedValue}</div>
      <div className="flex items-center gap-1 text-xs text-slate-400">
        <Icon className="w-3 h-3" />
        <span>{label}</span>
      </div>
    </div>
  );
}

function SignalGaugeSection({ signalData }: { signalData: SignalData }) {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      <h3 className="text-sm sm:text-base font-bold text-cyan-400 flex items-center gap-2">
        📈 시그널 강도
      </h3>
      <div className="flex justify-center gap-6 sm:gap-10 py-3 sm:py-4 px-2 bg-slate-800/30 rounded-lg">
        <SignalGauge value={signalData.buy} type="buy" />
        <SignalGauge value={signalData.sell} type="sell" />
      </div>
    </div>
  );
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
  const [fetchedSymbol, setFetchedSymbol] = useState<string | null>(null);

  useEffect(() => {
    if (fetchedSymbol === symbol) return;

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
        setFetchedSymbol(symbol);
      } catch (err) {
        console.error('AI Insight Error:', err);
        setError('Failed to generate AI analysis. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
  }, [symbol, data, fetchedSymbol]);

  return (
    <div className="h-full flex flex-col">
      {loading && (
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-slate-700/50" />
              <div className="h-4 w-24 rounded bg-slate-700/50" />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-5 w-32 rounded bg-slate-700/50" />
                <div className="h-4 w-full rounded bg-slate-800/50" />
                <div className="h-4 w-3/4 rounded bg-slate-800/50" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-28 rounded bg-slate-700/50" />
                <div className="h-4 w-full rounded bg-slate-800/50" />
                <div className="h-4 w-5/6 rounded bg-slate-800/50" />
                <div className="h-4 w-2/3 rounded bg-slate-800/50" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-24 rounded bg-slate-700/50" />
                <div className="h-4 w-full rounded bg-slate-800/50" />
                <div className="h-4 w-4/5 rounded bg-slate-800/50" />
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center">
            <div className="flex items-center gap-2 text-emerald-500/70">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs sm:text-sm font-medium">AI 분석 중...</span>
            </div>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center space-y-3 sm:space-y-4">
          <AlertCircle className="w-6 sm:w-8 h-6 sm:h-8 text-red-500" />
          <p className="text-red-400 font-medium text-sm sm:text-base">{error}</p>
        </div>
      )}

      {insight && !loading && (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-2 text-emerald-500">
            <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest">분석 완료</span>
          </div>
          <div className="space-y-4 sm:space-y-5 text-slate-300">
            {(() => {
              const signalData = parseSignalData(insight);
              const cleanedInsight = insight.replace(/<!--SIGNAL:\{.*?\}-->/g, '').trim();
              
              return cleanedInsight.split('\n\n').map((section, idx) => {
                const lines = section.trim().split('\n');
                const header = lines[0];
                const content = lines.slice(1);
                
                if (header.includes('📈') && signalData) {
                  return <SignalGaugeSection key={idx} signalData={signalData} />;
                }
                
                let headerColor = 'text-slate-200';
                if (header.includes('📊')) headerColor = 'text-blue-400';
                if (header.includes('📈')) headerColor = 'text-cyan-400';
                if (header.includes('🎯')) headerColor = 'text-emerald-400';
                if (header.includes('⚠️')) headerColor = 'text-amber-400';
                if (header.includes('💡')) headerColor = 'text-purple-400';
                
                return (
                  <div key={idx} className="space-y-1.5 sm:space-y-2">
                    <h3 className={`text-sm sm:text-base font-bold ${headerColor} flex items-center gap-2`}>
                      {header}
                    </h3>
                    <div className="pl-3 sm:pl-4 space-y-1 sm:space-y-1.5">
                      {content.map((line, lineIdx) => {
                        const trimmed = line.trim();
                        if (!trimmed || trimmed.includes('SIGNAL:')) return null;
                        
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
              });
            })()}
          </div>
          <div className="pt-4 sm:pt-6 border-t border-slate-800">
            <p className="text-[9px] sm:text-[10px] text-slate-500 italic">
              AI 생성 콘텐츠는 부정확할 수 있습니다. 데이터는 매일 갱신됩니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
