'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Star, X, ChevronLeft, ChevronRight, LogIn } from 'lucide-react';
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

export default function WatchlistDrawer() {
  const [isOpen, setIsOpen] = useState(false);
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderContent = () => {
    if (status === 'loading') {
      return (
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      );
    }

    if (!session) {
      return (
        <div className="p-4 flex flex-col items-center justify-center h-full text-center">
          <div className="p-3 rounded-full bg-slate-800 mb-4">
            <Star className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="text-sm font-medium text-slate-300 mb-2">로그인이 필요합니다</h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            관심종목을 저장하고<br />빠르게 확인하세요
          </p>
          <button
            onClick={() => signIn('google')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Google로 로그인
          </button>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      );
    }

    if (watchlist.length === 0) {
      return (
        <div className="p-4 flex flex-col items-center justify-center h-full text-center">
          <div className="p-3 rounded-full bg-yellow-500/10 mb-4">
            <Star className="w-6 h-6 text-yellow-400" />
          </div>
          <h3 className="text-sm font-medium text-slate-300 mb-2">관심종목이 없습니다</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            종목 페이지에서 별 아이콘을<br />눌러 추가하세요
          </p>
        </div>
      );
    }

    return (
      <div className="p-3 space-y-2">
        {watchlist.map((item) => (
          <div
            key={item.symbol}
            className="group flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all"
          >
            <Link
              href={`/stock/${item.symbol}`}
              className="flex-1 font-semibold text-white text-sm hover:text-emerald-400 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {item.symbol}
            </Link>
            <button
              onClick={() => removeMutation.mutate(item.symbol)}
              className="p-1 rounded-full hover:bg-slate-700 text-slate-500 hover:text-red-400 transition-colors"
              title="관심종목에서 제거"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const badgeCount = session && !isLoading ? watchlist.length : 0;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`absolute top-1/2 -translate-y-1/2 -left-10 flex items-center justify-center w-10 h-20 bg-slate-900 border border-slate-700 border-r-0 rounded-l-xl shadow-lg transition-all hover:bg-slate-800 ${
            isOpen ? '' : 'hover:-left-12'
          }`}
          title={isOpen ? '관심종목 닫기' : '관심종목 열기'}
        >
          <div className="flex flex-col items-center gap-1">
            {isOpen ? (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            )}
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            {badgeCount > 0 && (
              <span className="text-[10px] font-bold text-yellow-400">{badgeCount}</span>
            )}
          </div>
        </button>

        <div className="w-64 h-full bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <h2 className="font-semibold text-sm">관심종목</h2>
              {session && !isLoading && watchlist.length > 0 && (
                <span className="text-xs text-slate-500">({watchlist.length})</span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}
