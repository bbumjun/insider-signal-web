'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { QuarterlyFinancial } from '@/types';

interface MarginTrendChartProps {
  data: QuarterlyFinancial[];
}

export default function MarginTrendChart({ data }: MarginTrendChartProps) {
  const chartData = data.map(q => ({
    name: q.quarterLabel,
    grossMargin: q.grossMargin,
    operatingMargin: q.operatingMargin,
    netMargin: q.netMargin,
  }));

  const allMargins = chartData
    .flatMap(d => [d.grossMargin, d.operatingMargin, d.netMargin])
    .filter((v): v is number => v !== null);

  const minMargin = Math.floor(Math.min(...allMargins) - 2);
  const maxMargin = Math.ceil(Math.max(...allMargins) + 2);

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-slate-200">마진 추이</h3>
        <p className="text-xs text-slate-500 mt-1">분기별 마진율 변화 (%)</p>
      </div>

      <div className="h-[280px] sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
              domain={[minMargin, maxMargin]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value, name) => [
                typeof value === 'number' ? `${value.toFixed(1)}%` : '-',
                name === 'grossMargin'
                  ? '매출총이익률'
                  : name === 'operatingMargin'
                    ? '영업이익률'
                    : '순이익률',
              ]}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px' }}
              formatter={value => {
                const labels: Record<string, string> = {
                  grossMargin: '매출총이익률',
                  operatingMargin: '영업이익률',
                  netMargin: '순이익률',
                };
                return <span className="text-slate-300">{labels[value] || value}</span>;
              }}
            />
            <Line
              type="monotone"
              dataKey="grossMargin"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 2 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="operatingMargin"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ fill: '#10b981', r: 4, strokeWidth: 2 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="netMargin"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ fill: '#f59e0b', r: 4, strokeWidth: 2 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
