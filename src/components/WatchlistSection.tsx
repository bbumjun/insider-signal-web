'use client';

import { useSession } from 'next-auth/react';
import { Star, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface WatchlistItem {
  symbol: string;
  company_name: string | null;
  added_at: string;
}

async function fetchWatchlist(): Promise<WatchlistItem[]> {
  const res = await fetch('/api/watchlist');
  if (!res.ok) throw new Error('Failed to fetch watchlist');
  const data = await res.json();
  return data.watchlist || [];
}

export default function WatchlistSection() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const { data: watchlist = [], isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: fetchWatchlist,
    enabled: !!session?.user,
  });

  const removeMutation = useMutation({
    mutationFn: async (symbol: string) => {
      const res = await fetch(`/api/watchlist?symbol=${symbol}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove from watchlist');
      return symbol;
    },
    onMutate: async (symbol) => {
      await queryClient.cancelQueries({ queryKey: ['watchlist'] });
      const previous = queryClient.getQueryData<WatchlistItem[]>(['watchlist']);
      queryClient.setQueryData<WatchlistItem[]>(['watchlist'], (old = []) =>
        old.filter((item) => item.symbol !== symbol)
      );
      return { previous };
    },
    onError: (_err, _symbol, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['watchlist'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  if (status === 'loading' || isLoading) {
    return null;
  }

  if (!session) {
    return null;
  }

  if (watchlist.length === 0) {
    return (
      <div className="mt-8 sm:mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-slate-900/60 border border-slate-800/50 text-slate-400 text-xs sm:text-sm">
          <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>관심종목을 추가해보세요</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 sm:mt-12">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400" />
        <h2 className="text-base sm:text-lg font-semibold">관심종목</h2>
        <span className="text-xs sm:text-sm text-slate-500">({watchlist.length})</span>
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {watchlist.map((item) => (
          <div
            key={item.symbol}
            className="group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-slate-900/60 border border-slate-800/50 hover:border-emerald-500/30 hover:bg-slate-900/80 transition-all"
          >
            <Link
              href={`/stock/${item.symbol}`}
              className="flex items-center gap-1.5 sm:gap-2"
            >
              <span className="font-semibold text-white text-sm sm:text-base">{item.symbol}</span>
              {item.company_name && (
                <span className="text-xs sm:text-sm text-slate-400 max-w-[80px] sm:max-w-[120px] truncate hidden sm:inline">
                  {item.company_name}
                </span>
              )}
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                removeMutation.mutate(item.symbol);
              }}
              className="ml-0.5 sm:ml-1 p-0.5 sm:p-1 rounded-full hover:bg-slate-700 text-slate-500 hover:text-red-400 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
              title="관심종목에서 제거"
            >
              <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
