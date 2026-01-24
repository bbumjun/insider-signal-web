'use client';

import { useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Star } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const PENDING_WATCHLIST_KEY = 'pendingWatchlist';

interface WatchlistButtonProps {
  symbol: string;
  companyName?: string | null;
}

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

export default function WatchlistButton({ symbol, companyName }: WatchlistButtonProps) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const upperSymbol = symbol.toUpperCase();

  const { data: watchlist = [] } = useQuery({
    queryKey: ['watchlist'],
    queryFn: fetchWatchlist,
    enabled: !!session?.user,
  });

  const isInWatchlist = watchlist.some(item => item.symbol === upperSymbol);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return;

    const pending = localStorage.getItem(PENDING_WATCHLIST_KEY);
    if (!pending) return;

    try {
      const { symbol: pendingSymbol, companyName: pendingName } = JSON.parse(pending);
      localStorage.removeItem(PENDING_WATCHLIST_KEY);

      fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: pendingSymbol, companyName: pendingName }),
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      });
    } catch {
      localStorage.removeItem(PENDING_WATCHLIST_KEY);
    }
  }, [status, session, queryClient]);

  const handleLoginAndAdd = () => {
    localStorage.setItem(
      PENDING_WATCHLIST_KEY,
      JSON.stringify({ symbol: upperSymbol, companyName: companyName || null })
    );
    signIn('google');
  };

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: upperSymbol, companyName }),
      });
      if (!res.ok) throw new Error('Failed to add to watchlist');
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['watchlist'] });
      const previous = queryClient.getQueryData<WatchlistItem[]>(['watchlist']);
      queryClient.setQueryData<WatchlistItem[]>(['watchlist'], (old = []) => [
        {
          symbol: upperSymbol,
          company_name: companyName || null,
          added_at: new Date().toISOString(),
        },
        ...old,
      ]);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['watchlist'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/watchlist?symbol=${upperSymbol}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove from watchlist');
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['watchlist'] });
      const previous = queryClient.getQueryData<WatchlistItem[]>(['watchlist']);
      queryClient.setQueryData<WatchlistItem[]>(['watchlist'], (old = []) =>
        old.filter(item => item.symbol !== upperSymbol)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['watchlist'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const isLoading = addMutation.isPending || removeMutation.isPending;

  const handleClick = () => {
    if (isInWatchlist) {
      removeMutation.mutate();
    } else {
      addMutation.mutate();
    }
  };

  if (status === 'loading') {
    return (
      <button className="p-1.5 sm:p-2 rounded-lg text-slate-600" disabled>
        <Star className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    );
  }

  if (!session) {
    return (
      <button
        onClick={handleLoginAndAdd}
        className="p-1.5 sm:p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-yellow-400"
        title="로그인하고 관심종목에 추가"
      >
        <Star className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`p-1.5 sm:p-2 rounded-lg transition-all ${
        isInWatchlist
          ? 'text-yellow-400 hover:bg-yellow-400/10'
          : 'text-slate-400 hover:bg-slate-800 hover:text-yellow-400'
      } ${isLoading ? 'opacity-50' : ''}`}
      title={isInWatchlist ? '관심종목에서 제거' : '관심종목에 추가'}
    >
      <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${isInWatchlist ? 'fill-current' : ''}`} />
    </button>
  );
}
