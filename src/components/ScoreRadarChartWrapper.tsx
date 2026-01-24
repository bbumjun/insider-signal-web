'use client';

import { useEffect, useState } from 'react';
import ScoreRadarChart from './ScoreRadarChart';
import { CompanyScore } from '@/lib/api/financials';

interface ScoreRadarChartWrapperProps {
  symbol: string;
}

export default function ScoreRadarChartWrapper({ symbol }: ScoreRadarChartWrapperProps) {
  const [scores, setScores] = useState<CompanyScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchScores() {
      try {
        const res = await fetch(`/api/stock/${symbol}/metrics`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setScores(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchScores();
  }, [symbol]);

  if (loading) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-20 bg-slate-700 rounded" />
          <div className="flex items-center gap-2">
            <div className="h-3 w-8 bg-slate-700 rounded" />
            <div className="h-7 w-7 bg-slate-700 rounded" />
            <div className="h-3 w-12 bg-slate-700 rounded" />
          </div>
        </div>
        <div className="h-[250px] flex items-center justify-center">
          <div className="relative">
            <div className="w-40 h-40 rounded-full border-2 border-slate-700" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border-2 border-slate-700" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-slate-700" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="h-2.5 w-10 bg-slate-700 rounded mx-auto mb-1" />
              <div className="h-4 w-6 bg-slate-700 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !scores) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">기업 스코어</h3>
        <div className="h-[250px] flex items-center justify-center text-slate-500 text-sm">
          재무 데이터를 불러올 수 없습니다
        </div>
      </div>
    );
  }

  return <ScoreRadarChart scores={scores} symbol={symbol} />;
}
