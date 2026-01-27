'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Star, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface WatchlistQuote {
  symbol: string;
  companyName: string | null;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  marketState: string | null;
}

const REFRESH_INTERVAL = 15000;

export default function WatchlistSidebar() {
  const { data: session } = useSession();
  const [quotes, setQuotes] = useState<WatchlistQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchQuotes = useCallback(async () => {
    if (!session) return;

    try {
      const res = await fetch('/api/watchlist/quotes');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setQuotes(data.quotes || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch watchlist quotes:', err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchQuotes();

    const interval = setInterval(fetchQuotes, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchQuotes]);

  if (!session) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium">관심종목</span>
        </div>
        <p className="text-xs text-slate-500 text-center py-4">로그인 후 이용 가능합니다</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium">관심종목</span>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-slate-800/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium">관심종목</span>
        </div>
        <p className="text-xs text-slate-500 text-center py-4">관심종목을 추가해보세요</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium">관심종목</span>
          <span className="text-xs text-slate-500">({quotes.length})</span>
        </div>
        <button
          onClick={fetchQuotes}
          className="p-1 hover:bg-slate-800 rounded transition-colors"
          title="새로고침"
        >
          <RefreshCw className="w-3 h-3 text-slate-500" />
        </button>
      </div>

      <div className="space-y-1">
        {quotes.map(quote => (
          <Link
            key={quote.symbol}
            href={`/stock/${quote.symbol}`}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition-colors group"
          >
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm group-hover:text-blue-400 transition-colors">
                {quote.symbol}
              </div>
              {quote.companyName && (
                <div className="text-xs text-slate-500 truncate max-w-[100px]">
                  {quote.companyName}
                </div>
              )}
            </div>

            <div className="text-right">
              {quote.price !== null ? (
                <>
                  <div className="text-sm font-medium">${quote.price.toFixed(2)}</div>
                  {quote.changePercent !== null && (
                    <div
                      className={`flex items-center justify-end gap-0.5 text-xs ${
                        quote.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {quote.changePercent >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {quote.changePercent >= 0 ? '+' : ''}
                      {quote.changePercent.toFixed(2)}%
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs text-slate-500">-</div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {lastUpdated && (
        <div className="mt-3 pt-2 border-t border-slate-800">
          <div className="text-[10px] text-slate-600 text-center">
            {lastUpdated.toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}{' '}
            업데이트
          </div>
        </div>
      )}
    </div>
  );
}
