'use client';

import { useState, useMemo } from 'react';
import TimelineChart from '@/components/Timeline/TimelineChart';
import ActivityTimeline from '@/components/Timeline/ActivityTimeline';
import InsightPanel from '@/components/InsightPanel';
import PeriodSelector from '@/components/PeriodSelector';

import ScoreRadarChartWrapper from '@/components/ScoreRadarChartWrapper';
import CompanyDescription from '@/components/CompanyDescription';
import { StockData } from '@/types';

type Period = '1M' | '3M' | '1Y';

const PERIOD_DAYS: Record<Period, number> = {
  '1M': 30,
  '3M': 90,
  '1Y': 365,
};

interface StockClientWrapperProps {
  symbol: string;
  fullData: StockData;
}

export default function StockClientWrapper({ symbol, fullData }: StockClientWrapperProps) {
  const [period, setPeriod] = useState<Period>('3M');

  const filteredData = useMemo(() => {
    const days = PERIOD_DAYS[period];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const prices = fullData.prices.filter(p => new Date(p.date) >= cutoffDate);
    const insiderTransactions = fullData.insiderTransactions.filter(
      t => new Date(t.transactionDate) >= cutoffDate
    );
    const news = fullData.news.filter(n => {
      const date = n.datetime
        ? new Date(n.datetime * 1000)
        : n.publishedAt
          ? new Date(n.publishedAt)
          : null;
      return date && date >= cutoffDate;
    });

    return { prices, insiderTransactions, news };
  }, [fullData, period]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="bg-slate-900/40 border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold">차트</h2>
          <PeriodSelector currentPeriod={period} onPeriodChange={setPeriod} />
        </div>
        <div className="h-[300px] sm:h-[350px] lg:h-[400px] w-full">
          <TimelineChart
            key={period}
            symbol={symbol}
            prices={filteredData.prices}
            insiderTransactions={filteredData.insiderTransactions}
            news={filteredData.news}
            period={period}
          />
        </div>
      </section>

      <CompanyDescription symbol={symbol} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl sm:rounded-2xl min-h-[350px] sm:min-h-[400px]">
            <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
              <h3 className="text-base sm:text-lg font-bold">AI 인사이트</h3>
            </div>
            <InsightPanel symbol={symbol} data={fullData} />
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <ScoreRadarChartWrapper symbol={symbol} />

          <div className="bg-slate-900/40 border border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden">
            <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
              <h3 className="text-base sm:text-lg font-bold">타임라인</h3>
            </div>
            <ActivityTimeline
              insiderTransactions={filteredData.insiderTransactions}
              news={filteredData.news}
              limit={3}
              showMoreLink={`/stock/${symbol}/timeline`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
