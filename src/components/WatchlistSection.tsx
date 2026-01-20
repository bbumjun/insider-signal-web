'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Star, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';

interface WatchlistItem {
  symbol: string;
  company_name: string | null;
  added_at: string;
}

export default function WatchlistSection() {
  const { data: session, status } = useSession();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchWatchlist();
    } else {
      setIsLoading(false);
    }
  }, [session?.user]);

  const fetchWatchlist = async () => {
    try {
      const res = await fetch('/api/watchlist');
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data.watchlist || []);
      }
    } catch (err) {
      console.error('Failed to fetch watchlist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWatchlist = async (symbol: string) => {
    try {
      const res = await fetch(`/api/watchlist?symbol=${symbol}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol));
      }
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    }
  };

  if (status === 'loading' || isLoading) {
    return null;
  }

  if (!session) {
    return null;
  }

  if (watchlist.length === 0) {
    return (
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800/50 text-slate-400 text-sm">
          <Star className="w-4 h-4" />
          <span>관심종목을 추가해보세요</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        <h2 className="text-lg font-semibold">관심종목</h2>
        <span className="text-sm text-slate-500">({watchlist.length})</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {watchlist.map((item) => (
          <div
            key={item.symbol}
            className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/50 hover:border-emerald-500/30 hover:bg-slate-900/80 transition-all"
          >
            <Link
              href={`/stock/${item.symbol}`}
              className="flex items-center gap-2"
            >
              <span className="font-semibold text-white">{item.symbol}</span>
              {item.company_name && (
                <span className="text-sm text-slate-400 max-w-[120px] truncate hidden sm:inline">
                  {item.company_name}
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                removeFromWatchlist(item.symbol);
              }}
              className="ml-1 p-1 rounded-full hover:bg-slate-700 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              title="관심종목에서 제거"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
