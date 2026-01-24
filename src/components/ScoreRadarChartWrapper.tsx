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
        <div className="h-4 w-24 bg-slate-700 rounded mb-4" />
        <div className="h-[250px] flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin" />
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
