'use client';

import { useSession } from 'next-auth/react';
import { Star } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface WatchlistButtonProps {
  symbol: string;
  companyName?: string | null;
}

export default function WatchlistButton({ symbol, companyName }: WatchlistButtonProps) {
  const { data: session, status } = useSession();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkWatchlist = useCallback(async () => {
    if (!session?.user) return;
    
    try {
      const res = await fetch('/api/watchlist');
      if (res.ok) {
        const data = await res.json();
        const found = data.watchlist?.some(
          (item: { symbol: string }) => item.symbol === symbol.toUpperCase()
        );
        setIsInWatchlist(found);
      }
    } catch (err) {
      console.error('Failed to check watchlist:', err);
    }
  }, [session?.user, symbol]);

  useEffect(() => {
    checkWatchlist();
  }, [checkWatchlist]);

  const toggleWatchlist = async () => {
    if (!session?.user) return;
    
    setIsLoading(true);
    try {
      if (isInWatchlist) {
        const res = await fetch(`/api/watchlist?symbol=${symbol}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setIsInWatchlist(false);
        }
      } else {
        const res = await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol, companyName }),
        });
        if (res.ok) {
          setIsInWatchlist(true);
        }
      }
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <button className="p-2 rounded-lg text-slate-600" disabled>
        <Star className="w-5 h-5" />
      </button>
    );
  }

  if (!session) {
    return (
      <button
        className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
        title="로그인 후 관심종목에 추가할 수 있습니다"
        disabled
      >
        <Star className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleWatchlist}
      disabled={isLoading}
      className={`p-2 rounded-lg transition-all ${
        isInWatchlist
          ? 'text-yellow-400 hover:bg-yellow-400/10'
          : 'text-slate-400 hover:bg-slate-800 hover:text-yellow-400'
      } ${isLoading ? 'opacity-50' : ''}`}
      title={isInWatchlist ? '관심종목에서 제거' : '관심종목에 추가'}
    >
      <Star className={`w-5 h-5 ${isInWatchlist ? 'fill-current' : ''}`} />
    </button>
  );
}
