'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { QuarterlyFinancial } from '@/types';

interface RevenueProfitChartProps {
  data: QuarterlyFinancial[];
  currency: string;
}

function formatLargeNumber(value: number): string {
  if (Math.abs(value) >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
  return value.toFixed(0);
}

export default function RevenueProfitChart({ data, currency }: RevenueProfitChartProps) {
  const chartData = data.map(q => ({
    name: q.quarterLabel,
    revenue: q.revenue,
    netIncome: q.netIncome,
    operatingIncome: q.operatingIncome,
  }));

  const revenueValues = chartData.map(d => d.revenue).filter((v): v is number => v !== null);
  const incomeValues = chartData
    .flatMap(d => [d.netIncome, d.operatingIncome])
    .filter((v): v is number => v !== null);

  const revenueMin = Math.min(...revenueValues) * 0.9;
  const revenueMax = Math.max(...revenueValues) * 1.05;
  const incomeMin = Math.min(...incomeValues) * 0.9;
  const incomeMax = Math.max(...incomeValues) * 1.1;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-slate-200">매출 & 이익 추이</h3>
        <p className="text-xs text-slate-500 mt-1">
          분기별 매출(막대), 영업이익/순이익(선) ({currency})
        </p>
      </div>

      <div className="h-[280px] sm:h-[320px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={{ stroke: '#475569' }}
            />
            <YAxis
              yAxisId="revenue"
              orientation="left"
              tick={{ fill: '#3b82f6', fontSize: 10 }}
              tickFormatter={formatLargeNumber}
              axisLine={{ stroke: '#3b82f6' }}
              domain={[revenueMin, revenueMax]}
              width={45}
            />
            <YAxis
              yAxisId="income"
              orientation="right"
              tick={{ fill: '#10b981', fontSize: 10 }}
              tickFormatter={formatLargeNumber}
              axisLine={{ stroke: '#10b981' }}
              domain={[incomeMin, incomeMax]}
              width={45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value, name) => [
                typeof value === 'number' ? `$${formatLargeNumber(value)}` : '-',
                name === 'revenue' ? '매출' : name === 'operatingIncome' ? '영업이익' : '순이익',
              ]}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px' }}
              formatter={value => {
                const labels: Record<string, string> = {
                  revenue: '매출 (좌)',
                  operatingIncome: '영업이익 (우)',
                  netIncome: '순이익 (우)',
                };
                return <span className="text-slate-300">{labels[value] || value}</span>;
              }}
            />
            <Bar
              yAxisId="revenue"
              dataKey="revenue"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              fillOpacity={0.8}
            />
            <Line
              yAxisId="income"
              type="monotone"
              dataKey="operatingIncome"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ fill: '#10b981', r: 4 }}
            />
            <Line
              yAxisId="income"
              type="monotone"
              dataKey="netIncome"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ fill: '#f59e0b', r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
