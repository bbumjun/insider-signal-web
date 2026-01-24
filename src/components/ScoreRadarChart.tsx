'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { CompanyScore } from '@/lib/api/financials';

interface ScoreRadarChartProps {
  scores: CompanyScore;
  symbol: string;
}

const SCORE_LABELS: Record<keyof Omit<CompanyScore, 'overall'>, string> = {
  profitability: '수익성',
  growth: '성장성',
  margin: '마진',
  stability: '안정성',
  cashFlow: '현금흐름',
  valuation: '밸류',
};

const SCORE_DESCRIPTIONS: Record<keyof Omit<CompanyScore, 'overall'>, string> = {
  profitability: 'ROE (자기자본이익률)',
  growth: '매출 성장률 (YoY)',
  margin: '영업이익률',
  stability: '유동비율',
  cashFlow: 'FCF 성장률 (5Y)',
  valuation: 'PEG (낮을수록 저평가)',
};

function getScoreColor(score: number): string {
  if (score >= 70) return '#10b981';
  if (score >= 50) return '#fbbf24';
  return '#ef4444';
}

function getOverallGrade(score: number): { grade: string; color: string } {
  if (score >= 80) return { grade: 'A', color: '#10b981' };
  if (score >= 70) return { grade: 'B+', color: '#34d399' };
  if (score >= 60) return { grade: 'B', color: '#fbbf24' };
  if (score >= 50) return { grade: 'C+', color: '#f59e0b' };
  if (score >= 40) return { grade: 'C', color: '#f97316' };
  return { grade: 'D', color: '#ef4444' };
}

export default function ScoreRadarChart({ scores, symbol }: ScoreRadarChartProps) {
  const MIN_DISPLAY_VALUE = 10;

  const data = (Object.keys(SCORE_LABELS) as Array<keyof typeof SCORE_LABELS>).map(key => ({
    subject: SCORE_LABELS[key],
    value: Math.max(MIN_DISPLAY_VALUE, scores[key]),
    actualValue: scores[key],
    fullMark: 100,
    description: SCORE_DESCRIPTIONS[key],
  }));

  const { grade, color } = getOverallGrade(scores.overall);

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">기업 스코어</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">종합</span>
          <span className="text-2xl font-bold" style={{ color }}>
            {grade}
          </span>
          <span className="text-sm text-slate-500">({scores.overall}점)</span>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickCount={5}
            />
            <Radar
              name={symbol}
              dataKey="value"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-2 shadow-lg">
                    <div className="text-xs text-slate-300 font-medium">{item.subject}</div>
                    <div className="text-xs text-slate-500">{item.description}</div>
                    <div
                      className="text-sm font-bold mt-1"
                      style={{ color: getScoreColor(item.actualValue) }}
                    >
                      {item.actualValue}점
                    </div>
                  </div>
                );
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        {data.map(item => (
          <div key={item.subject} className="text-center">
            <div className="text-[10px] text-slate-500">{item.subject}</div>
            <div
              className="text-sm font-semibold"
              style={{ color: getScoreColor(item.actualValue) }}
            >
              {item.actualValue}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
