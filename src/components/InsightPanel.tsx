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
  const animatedPercentage = animated ? percentage : 0;
  
  const isBuy = type === 'buy';
  const label = isBuy ? '매수' : '매도';
  const subLabel = isBuy ? 'BUY SIGNAL' : 'SELL SIGNAL';
  
  const gradientId = `gradient-${type}`;
  const glowColor = isBuy ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)';
  const strokeColor = isBuy ? 'url(#gradient-buy)' : 'url(#gradient-sell)';
  const textColor = isBuy ? 'text-emerald-400' : 'text-red-400';
  const bgGlow = isBuy ? 'shadow-emerald-500/20' : 'shadow-red-500/20';

  const size = 100;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className={`relative w-[100px] h-[58px] sm:w-[120px] sm:h-[68px]`}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="gradient-buy" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="gradient-sell" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <filter id={`glow-${type}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path
            d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            filter={`url(#glow-${type})`}
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
          />
          {[0, 1, 2, 3, 4].map((tick) => {
            const angle = Math.PI - (tick / 4) * Math.PI;
            const innerRadius = radius - strokeWidth/2 - 4;
            const x = size/2 + innerRadius * Math.cos(angle);
            const y = size/2 - innerRadius * Math.sin(angle);
            return (
              <circle
                key={tick}
                cx={x}
                cy={y}
                r={1.5}
                fill={tick < clampedValue ? (isBuy ? '#10b981' : '#ef4444') : '#334155'}
                className="transition-colors duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
          <span className={`text-2xl sm:text-3xl font-bold ${textColor} leading-none`}>
            {clampedValue}
          </span>
          <span className="text-[8px] sm:text-[9px] text-slate-500 tracking-wider mt-0.5">
            / 5
          </span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <div className={`text-xs sm:text-sm font-semibold ${textColor}`}>{label}</div>
        <div className="text-[9px] sm:text-[10px] text-slate-500 tracking-widest">{subLabel}</div>
      </div>
    </div>
  );
}

function SignalGaugeSection({ signalData }: { signalData: SignalData }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-sm sm:text-base font-bold text-cyan-400 flex items-center gap-2">
        📈 시그널 강도
      </h3>
      <div className="flex justify-center items-center gap-8 sm:gap-16 py-4 sm:py-6 px-4 bg-gradient-to-b from-slate-800/40 to-slate-900/40 rounded-xl border border-slate-700/30">
        <SignalGauge value={signalData.buy} type="buy" />
        <div className="w-px h-20 bg-gradient-to-b from-transparent via-slate-600 to-transparent" />
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
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedSymbol, setFetchedSymbol] = useState<string | null>(null);

  useEffect(() => {
    if (fetchedSymbol === symbol) return;

    const controller = new AbortController();

    const fetchInsight = async () => {
      setLoading(true);
      setStreaming(false);
      setError(null);
      setInsight(null);
      
      try {
        const response = await fetch(`/api/stock/${symbol}/analysis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analysis');
        }

        const isStreaming = response.headers.get('X-Cache') === 'MISS';
        
        if (isStreaming && response.body) {
          setStreaming(true);
          setLoading(false);
          
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let accumulated = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            accumulated += decoder.decode(value, { stream: true });
            setInsight(accumulated);
          }
          
          if (accumulated.startsWith('[ERROR]')) {
            throw new Error(accumulated.replace('[ERROR] ', ''));
          }
          
          setStreaming(false);
        } else {
          const text = await response.text();
          if (text.startsWith('[ERROR]')) {
            throw new Error(text.replace('[ERROR] ', ''));
          }
          setInsight(text);
          setLoading(false);
        }
        
        setFetchedSymbol(symbol);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error('AI Insight Error:', err);
        setError('AI 분석 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
        setLoading(false);
        setStreaming(false);
      }
    };

    fetchInsight();
    
    return () => controller.abort();
  }, [symbol, data, fetchedSymbol]);

  return (
    <div className="h-full flex flex-col">
      {loading && (
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin text-emerald-500/70" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-500/70">AI 분석 중...</span>
            </div>
            
            <div className="space-y-1.5 sm:space-y-2">
              <div className="h-5 w-24 rounded bg-slate-700/50" />
              <div className="h-4 w-full rounded bg-slate-800/50" />
              <div className="h-4 w-4/5 rounded bg-slate-800/50" />
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="h-5 w-28 rounded bg-slate-700/50" />
              <div className="flex justify-center items-center gap-8 sm:gap-16 py-4 sm:py-6 px-4 bg-gradient-to-b from-slate-800/40 to-slate-900/40 rounded-xl border border-slate-700/30">
                <div className="flex flex-col items-center">
                  <div className="w-[100px] h-[58px] sm:w-[120px] sm:h-[68px] rounded-t-full bg-slate-700/30" />
                  <div className="mt-2 space-y-1 flex flex-col items-center">
                    <div className="h-4 w-8 rounded bg-slate-700/50" />
                    <div className="h-3 w-16 rounded bg-slate-800/50" />
                  </div>
                </div>
                <div className="w-px h-20 bg-gradient-to-b from-transparent via-slate-600 to-transparent" />
                <div className="flex flex-col items-center">
                  <div className="w-[100px] h-[58px] sm:w-[120px] sm:h-[68px] rounded-t-full bg-slate-700/30" />
                  <div className="mt-2 space-y-1 flex flex-col items-center">
                    <div className="h-4 w-8 rounded bg-slate-700/50" />
                    <div className="h-3 w-16 rounded bg-slate-800/50" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <div className="h-5 w-24 rounded bg-slate-700/50" />
              <div className="pl-3 sm:pl-4 space-y-1.5">
                <div className="h-4 w-full rounded bg-slate-800/50" />
                <div className="h-4 w-5/6 rounded bg-slate-800/50" />
                <div className="h-4 w-3/4 rounded bg-slate-800/50" />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <div className="h-5 w-28 rounded bg-slate-700/50" />
              <div className="pl-3 sm:pl-4 space-y-1.5">
                <div className="h-4 w-full rounded bg-slate-800/50" />
                <div className="h-4 w-4/5 rounded bg-slate-800/50" />
              </div>
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
            {streaming ? (
              <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
            ) : (
              <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
            )}
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest">
              {streaming ? '분석 중...' : '분석 완료'}
            </span>
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
