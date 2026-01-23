'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ActivityTimeline from '@/components/Timeline/ActivityTimeline';
import PeriodSelector from '@/components/PeriodSelector';
import { InsiderTransaction, CompanyNews } from '@/types';

type Period = '1M' | '3M' | '1Y';

const PERIOD_DAYS: Record<Period, number> = {
  '1M': 30,
  '3M': 90,
  '1Y': 365,
};

interface TimelinePageClientProps {
  insiderTransactions: InsiderTransaction[];
  news: CompanyNews[];
}

export default function TimelinePageClient({ insiderTransactions, news }: TimelinePageClientProps) {
  const searchParams = useSearchParams();
  const initialDate = searchParams.get('date');
  const [period, setPeriod] = useState<Period>('1Y');

  const filteredData = useMemo(() => {
    const days = PERIOD_DAYS[period];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filteredTransactions = insiderTransactions.filter(
      t => new Date(t.transactionDate) >= cutoffDate
    );
    const filteredNews = news.filter(n => {
      const date = n.datetime ? new Date(n.datetime * 1000) : n.publishedAt ? new Date(n.publishedAt) : null;
      return date && date >= cutoffDate;
    });

    return { insiderTransactions: filteredTransactions, news: filteredNews };
  }, [insiderTransactions, news, period]);

  const totalCount = filteredData.insiderTransactions.length + filteredData.news.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">
          총 {totalCount}개의 활동
        </span>
        <PeriodSelector currentPeriod={period} onPeriodChange={setPeriod} />
      </div>
      
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden">
        <ActivityTimeline 
          insiderTransactions={filteredData.insiderTransactions} 
          news={filteredData.news}
          initialExpandDate={initialDate || undefined}
        />
      </div>
    </div>
  );
}
