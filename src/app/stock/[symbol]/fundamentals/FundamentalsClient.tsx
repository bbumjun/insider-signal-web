'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { FinancialTrendData } from '@/types';
import RevenueProfitChart from '@/components/Fundamentals/RevenueProfitChart';
import MarginTrendChart from '@/components/Fundamentals/MarginTrendChart';
import GrowthRateChart from '@/components/Fundamentals/GrowthRateChart';

interface FundamentalsClientProps {
  symbol: string;
}

function TrendBadge({ trend }: { trend: 'improving' | 'stable' | 'declining' | null }) {
  if (!trend) return null;

  const config = {
    improving: { icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/10', label: '개선 중' },
    stable: { icon: Minus, color: 'text-slate-400 bg-slate-500/10', label: '안정' },
    declining: { icon: TrendingDown, color: 'text-red-400 bg-red-500/10', label: '하락 중' },
  };

  const { icon: Icon, color, label } = config[trend];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${color}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
            <div className="h-4 bg-slate-700 rounded w-24 mb-2" />
            <div className="h-8 bg-slate-700 rounded w-16" />
          </div>
        ))}
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
          <div className="h-5 bg-slate-700 rounded w-32 mb-4" />
          <div className="h-[300px] bg-slate-800/50 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function FundamentalsClient({ symbol }: FundamentalsClientProps) {
  const [data, setData] = useState<FinancialTrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/stock/${symbol}/financials`);
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [symbol]);

  if (loading) return <LoadingSkeleton />;

  if (error || !data) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-200 mb-2">데이터를 불러올 수 없습니다</h3>
        <p className="text-slate-400 text-sm">
          해당 종목의 재무 데이터가 없거나 일시적인 오류가 발생했습니다.
        </p>
      </div>
    );
  }

  const latestQuarter = data.quarters[data.quarters.length - 1];
  const latestRevenueGrowth = latestQuarter?.revenueGrowthYoY;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">최근 매출 성장률 (YoY)</div>
          <div className="flex items-center gap-2">
            <span
              className={`text-2xl font-bold ${
                latestRevenueGrowth && latestRevenueGrowth > 0
                  ? 'text-emerald-400'
                  : latestRevenueGrowth && latestRevenueGrowth < 0
                    ? 'text-red-400'
                    : 'text-slate-300'
              }`}
            >
              {latestRevenueGrowth !== null
                ? `${latestRevenueGrowth > 0 ? '+' : ''}${latestRevenueGrowth.toFixed(1)}%`
                : '-'}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">마진 추세</div>
          <TrendBadge trend={data.latestMetrics.marginTrend} />
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">수익성 추세</div>
          <TrendBadge trend={data.latestMetrics.profitabilityTrend} />
        </div>
      </div>

      <RevenueProfitChart data={data.quarters} currency={data.currency} />
      <MarginTrendChart data={data.quarters} />
      <GrowthRateChart data={data.quarters} />

      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-semibold text-slate-200 mb-4">
          분기별 상세 데이터
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 px-2 text-slate-400 font-medium">분기</th>
                <th className="text-right py-2 px-2 text-slate-400 font-medium">매출</th>
                <th className="text-right py-2 px-2 text-slate-400 font-medium">영업이익</th>
                <th className="text-right py-2 px-2 text-slate-400 font-medium">순이익</th>
                <th className="text-right py-2 px-2 text-slate-400 font-medium">영업이익률</th>
                <th className="text-right py-2 px-2 text-slate-400 font-medium">YoY 성장</th>
              </tr>
            </thead>
            <tbody>
              {[...data.quarters].reverse().map((q, idx) => (
                <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="py-2 px-2 text-slate-200">{q.quarterLabel}</td>
                  <td className="py-2 px-2 text-right text-slate-300">
                    {q.revenue ? `$${(q.revenue / 1e9).toFixed(2)}B` : '-'}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-300">
                    {q.operatingIncome ? `$${(q.operatingIncome / 1e9).toFixed(2)}B` : '-'}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-300">
                    {q.netIncome ? `$${(q.netIncome / 1e9).toFixed(2)}B` : '-'}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {q.operatingMargin !== null ? (
                      <span
                        className={
                          q.operatingMargin >= 20
                            ? 'text-emerald-400'
                            : q.operatingMargin >= 10
                              ? 'text-slate-300'
                              : 'text-red-400'
                        }
                      >
                        {q.operatingMargin.toFixed(1)}%
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {q.revenueGrowthYoY !== null ? (
                      <span
                        className={
                          q.revenueGrowthYoY > 0
                            ? 'text-emerald-400'
                            : q.revenueGrowthYoY < 0
                              ? 'text-red-400'
                              : 'text-slate-300'
                        }
                      >
                        {q.revenueGrowthYoY > 0 ? '+' : ''}
                        {q.revenueGrowthYoY.toFixed(1)}%
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
