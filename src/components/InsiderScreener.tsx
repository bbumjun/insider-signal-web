'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

interface InsiderTrade {
  symbol: string;
  companyName: string;
  totalValue: number;
  tradeCount: number;
  insiderCount: number;
  latestDate: string;
}

export default function InsiderScreener() {
  const [trades, setTrades] = useState<InsiderTrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/insider-screener/list')
      .then(res => res.json())
      .then(data => {
        setTrades(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch insider trades', err);
        setLoading(false);
      });
  }, []);

  const formatValue = (v: number) => {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  };

  if (loading) {
    return (
      <section className="mt-16 sm:mt-24">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">최근 내부자 매수</h2>
            <p className="text-slate-400 text-sm">지난 30일 공개시장 매수 TOP 10</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-slate-800 rounded w-16 mb-2" />
              <div className="h-3 bg-slate-800 rounded w-32 mb-3" />
              <div className="h-3 bg-slate-800 rounded w-24" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (trades.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 sm:mt-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">최근 내부자 매수</h2>
          <p className="text-slate-400 text-sm">지난 30일 공개시장 매수 TOP 10</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trades.map((trade) => (
          <Link
            key={trade.symbol}
            href={`/stock/${trade.symbol}`}
            className="group bg-slate-900/40 border border-slate-800 rounded-xl p-4 hover:border-yellow-500/30 hover:bg-slate-900/60 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-lg font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors">
                  {trade.symbol}
                </div>
                <div className="text-xs text-slate-400 line-clamp-1">
                  {trade.companyName}
                </div>
              </div>
              <div className="text-xs text-slate-500">
                {new Date(trade.latestDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>
                <div className="text-emerald-400 font-semibold">
                  {formatValue(trade.totalValue)}
                </div>
                <div className="text-xs text-slate-500">
                  {trade.insiderCount}명 · {trade.tradeCount}건
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
