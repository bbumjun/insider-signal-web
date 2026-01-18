import { Suspense } from 'react';
import TimelineChart from '@/components/Timeline/TimelineChart';
import ActivityTimeline from '@/components/Timeline/ActivityTimeline';
import InsightPanel from '@/components/InsightPanel';
import { fetchInsiderTransactions, fetchCompanyNews } from '@/lib/api/finnhub';
import { getMockStockData } from '@/lib/utils/mockData';
import { ChevronLeft, Share2, Star } from 'lucide-react';
import Link from 'next/link';
import { StockData } from '@/types';
import YahooFinance from 'yahoo-finance2';
import PeriodSelector from '@/components/PeriodSelector';

const yahooFinance = new YahooFinance();

type Period = '1M' | '3M' | '1Y';

const PERIOD_DAYS: Record<Period, number> = {
  '1M': 30,
  '3M': 90,
  '1Y': 365,
};

interface StockPageProps {
  params: Promise<{ symbol: string }>;
  searchParams: Promise<{ period?: string }>;
}

async function getStockData(symbol: string, period: Period): Promise<StockData> {
  try {
    const days = PERIOD_DAYS[period];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    
    const chartResult = await yahooFinance.chart(symbol, {
      period1: startDateStr,
      interval: '1d',
    });

    const quotes = chartResult.quotes;
    if (!quotes || quotes.length === 0) throw new Error('No price data');

    const prices = quotes
      .filter((q) => q.date && q.close != null)
      .map((q) => ({
        date: q.date!.toISOString().split('T')[0],
        close: q.close!,
      }));

    const [allInsiderTransactions, news] = await Promise.all([
      fetchInsiderTransactions(symbol).catch(() => []),
      fetchCompanyNews(symbol, startDateStr, todayStr).catch(() => []),
    ]);

    const insiderTransactions = allInsiderTransactions.filter((t) => {
      const txDate = new Date(t.transactionDate);
      return txDate >= startDate;
    });

    if (prices.length === 0) {
      console.log(`No real price data for ${symbol}, returning mock`);
      return getMockStockData(symbol);
    }

    return { prices, insiderTransactions, news };
  } catch (err) {
    console.error('Data fetching error:', err);
    return getMockStockData(symbol);
  }
}

export default async function StockPage({ params, searchParams }: StockPageProps) {
  const { symbol } = await params;
  const { period: periodParam } = await searchParams;
  const period: Period = (['1M', '3M', '1Y'] as const).includes(periodParam as Period) 
    ? (periodParam as Period) 
    : '3M';
  const data = await getStockData(symbol, period);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
      <header className="border-b border-slate-800 bg-black/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                {symbol}
                <span className="text-slate-500 text-sm font-normal">Stock Analysis</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
              <Star className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold">Price Action & Signals</h2>
            <PeriodSelector currentPeriod={period} />
          </div>
          <div className="h-[400px] w-full">
            <Suspense fallback={<div className="w-full h-full bg-slate-800/20 animate-pulse rounded-xl" />}>
              <TimelineChart symbol={symbol} prices={data.prices} insiderTransactions={data.insiderTransactions} news={data.news} />
            </Suspense>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 flex flex-col">
            <h3 className="text-lg font-bold mb-4">Activity Timeline</h3>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-y-auto max-h-[600px] custom-scrollbar">
              <ActivityTimeline insiderTransactions={data.insiderTransactions} news={data.news} />
            </div>
          </div>
          
          <div className="lg:col-span-7 flex flex-col">
            <h3 className="text-lg font-bold mb-4">AI Pattern Insights</h3>
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex-1 min-h-[400px]">
              <InsightPanel symbol={symbol} data={data} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
