'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, ChevronRight, TrendingUp } from 'lucide-react';

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
      <section className="mt-12 sm:mt-16">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-semibold">Hot Insider Buys</h2>
          <span className="text-xs text-slate-500 ml-1">30D</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-36 bg-slate-900/60 border border-slate-800/50 rounded-lg p-3 animate-pulse">
              <div className="h-5 bg-slate-800 rounded w-12 mb-2" />
              <div className="h-3 bg-slate-800 rounded w-full mb-2" />
              <div className="h-4 bg-slate-800 rounded w-16" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (trades.length === 0) return null;

  return (
    <section className="mt-12 sm:mt-16">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-500/10">
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold">Hot Insider Buys</h2>
          <span className="text-[10px] text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded">30D</span>
        </div>
      </div>
      
      <div className="relative">
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {trades.slice(0, 10).map((trade, idx) => (
            <Link
              key={trade.symbol}
              href={`/stock/${trade.symbol}`}
              className="group flex-shrink-0 snap-start"
            >
              <div className="relative w-[140px] bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800/60 rounded-xl p-3 hover:border-amber-500/40 hover:from-slate-800/80 hover:to-slate-900/60 transition-all duration-200">
                {idx < 3 && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[10px] font-bold text-black shadow-lg shadow-amber-500/20">
                    {idx + 1}
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-base font-bold text-amber-400 group-hover:text-amber-300 transition-colors">
                    {trade.symbol}
                  </span>
                  <TrendingUp className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <p className="text-[10px] text-slate-500 truncate mb-2 leading-tight">
                  {trade.companyName}
                </p>
                
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-sm font-semibold text-emerald-400">
                      {formatValue(trade.totalValue)}
                    </div>
                    <div className="text-[9px] text-slate-600">
                      {trade.insiderCount} insider{trade.insiderCount > 1 ? 's' : ''}
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-black to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
