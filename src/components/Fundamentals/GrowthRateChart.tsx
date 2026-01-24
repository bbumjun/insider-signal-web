'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { QuarterlyFinancial } from '@/types';

interface GrowthRateChartProps {
  data: QuarterlyFinancial[];
}

export default function GrowthRateChart({ data }: GrowthRateChartProps) {
  const chartData = data.map(q => ({
    name: q.quarterLabel,
    revenueGrowth: q.revenueGrowthYoY,
    netIncomeGrowth: q.netIncomeGrowthYoY,
    hasData: q.revenueGrowthYoY !== null || q.netIncomeGrowthYoY !== null,
  }));

  const allGrowth = chartData
    .flatMap(d => [d.revenueGrowth, d.netIncomeGrowth])
    .filter((v): v is number => v !== null);

  const hasLimitedData = allGrowth.length <= 2;

  if (allGrowth.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 sm:p-6">
        <div className="mb-4">
          <h3 className="text-sm sm:text-base font-semibold text-slate-200">YoY 성장률</h3>
          <p className="text-xs text-slate-500 mt-1">전년 동기 대비 성장률 (%)</p>
        </div>
        <div className="h-[280px] flex items-center justify-center text-slate-500 text-sm">
          YoY 비교 데이터가 부족합니다 (최소 1년 이상의 데이터 필요)
        </div>
      </div>
    );
  }

  const minGrowth = Math.min(0, Math.floor(Math.min(...allGrowth) - 5));
  const maxGrowth = Math.ceil(Math.max(...allGrowth) + 5);

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-slate-200">YoY 성장률</h3>
        <p className="text-xs text-slate-500 mt-1">전년 동기 대비 성장률 (%)</p>
        {hasLimitedData && (
          <p className="text-xs text-amber-500/80 mt-1">
            * 전년 동기 데이터가 있는 분기만 표시됩니다
          </p>
        )}
      </div>

      <div className="h-[280px] sm:h-[320px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={{ stroke: '#475569' }}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickFormatter={v => `${v}%`}
              axisLine={{ stroke: '#475569' }}
              domain={[minGrowth, maxGrowth]}
            />
            <ReferenceLine y={0} stroke="#64748b" strokeWidth={1} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value, name) => [
                typeof value === 'number' ? `${value.toFixed(1)}%` : '-',
                name === 'revenueGrowth' ? '매출 성장률' : '순이익 성장률',
              ]}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px' }}
              formatter={value => {
                const labels: Record<string, string> = {
                  netIncomeGrowth: '순이익 성장률',
                  revenueGrowth: '매출 성장률',
                };
                return <span className="text-slate-300">{labels[value] || value}</span>;
              }}
            />
            <Bar dataKey="netIncomeGrowth" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="revenueGrowth" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
