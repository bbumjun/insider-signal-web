import { fetchInsiderTransactions, fetchCompanyNews } from '@/lib/api/finnhub';
import { getMockStockData } from '@/lib/utils/mockData';
import { ChevronLeft, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { StockData } from '@/types';
import YahooFinance from 'yahoo-finance2';
import ShareButton from '@/components/ShareButton';
import StockClientWrapper from '@/components/StockClientWrapper';
import SearchBar from '@/components/SearchBar';
import WatchlistButton from '@/components/WatchlistButton';
import AuthButton from '@/components/AuthButton';

const yahooFinance = new YahooFinance();

interface StockPageProps {
  params: Promise<{ symbol: string }>;
}

interface StockDataWithMeta extends StockData {
  companyName: string | null;
  changePercent: number | null;
}

async function getStockData(symbol: string): Promise<StockDataWithMeta> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 365);
    const startDateStr = startDate.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    
    const [chartResult, quoteResult, insiderTransactions, news] = await Promise.all([
      yahooFinance.chart(symbol, {
        period1: startDateStr,
        interval: '1d',
      }),
      yahooFinance.quote(symbol).catch(() => null),
      fetchInsiderTransactions(symbol).catch(() => []),
      fetchCompanyNews(symbol, startDateStr, todayStr).catch(() => []),
    ]);

    const companyName = quoteResult?.shortName || quoteResult?.longName || chartResult.meta?.shortName || chartResult.meta?.longName || null;
    const changePercent = typeof quoteResult?.regularMarketChangePercent === 'number' 
      ? quoteResult.regularMarketChangePercent 
      : null;
    
    const quotes = chartResult.quotes;
    if (!quotes || quotes.length === 0) throw new Error('No price data');

    const prices = quotes
      .filter((q) => q.date && q.close != null)
      .map((q) => ({
        date: q.date!.toISOString().split('T')[0],
        close: q.close!,
      }));

    if (prices.length === 0) {
      console.log(`No real price data for ${symbol}, returning mock`);
      return { ...getMockStockData(symbol), companyName, changePercent };
    }

    return { prices, insiderTransactions, news, companyName, changePercent };
  } catch (err) {
    console.error('Data fetching error:', err);
    return { ...getMockStockData(symbol), companyName: null, changePercent: null };
  }
}

export default async function StockPage({ params }: StockPageProps) {
  const { symbol } = await params;
  const data = await getStockData(symbol);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
      <header className="border-b border-slate-800 bg-black/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Link href="/" className="p-1.5 sm:p-2 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0">
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div className="h-5 sm:h-6 w-px bg-slate-800 flex-shrink-0 hidden sm:block" />
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold flex items-center gap-1 sm:gap-2">
                <span className="flex-shrink-0">{symbol}</span>
                {data.companyName && (
                  <span className="text-slate-400 text-xs sm:text-sm font-normal truncate max-w-[100px] sm:max-w-[250px]">
                    {data.companyName}
                  </span>
                )}
                {data.changePercent !== null && (
                  <span className={`flex items-center gap-0.5 text-xs sm:text-sm font-semibold px-1.5 py-0.5 rounded ${
                    data.changePercent >= 0 
                      ? 'text-emerald-400 bg-emerald-500/10' 
                      : 'text-red-400 bg-red-500/10'
                  }`}>
                    {data.changePercent >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
                  </span>
                )}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            <div className="hidden sm:block">
              <SearchBar compact />
            </div>
            <ShareButton symbol={symbol} />
            <WatchlistButton symbol={symbol} companyName={data.companyName} />
            <AuthButton />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <StockClientWrapper symbol={symbol} fullData={data} />
      </div>
    </main>
  );
}
