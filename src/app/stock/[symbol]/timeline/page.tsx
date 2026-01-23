import { fetchInsiderTransactions, fetchCompanyNews } from '@/lib/api/finnhub';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import TimelinePageClient from './TimelinePageClient';

interface TimelinePageProps {
  params: Promise<{ symbol: string }>;
}

async function getTimelineData(symbol: string) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 365);
  const startDateStr = startDate.toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  const [insiderTransactions, news] = await Promise.all([
    fetchInsiderTransactions(symbol).catch(() => []),
    fetchCompanyNews(symbol, startDateStr, todayStr).catch(() => []),
  ]);

  return { insiderTransactions, news };
}

export default async function TimelinePage({ params }: TimelinePageProps) {
  const { symbol } = await params;
  const data = await getTimelineData(symbol);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
      <header className="border-b border-slate-800 bg-black/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center">
          <Link 
            href={`/stock/${symbol}`} 
            className="p-1.5 sm:p-2 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0 mr-3"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <h1 className="text-base sm:text-lg font-bold">
            {symbol} 타임라인
          </h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <TimelinePageClient 
          insiderTransactions={data.insiderTransactions} 
          news={data.news} 
        />
      </div>
    </main>
  );
}
