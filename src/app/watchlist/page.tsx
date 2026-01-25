'use client';

import { useSession, signIn } from 'next-auth/react';
import { Star, X, LogIn, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Logo from '@/components/Logo';
import AuthButton from '@/components/AuthButton';

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

export default function WatchlistPage() {
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
    onMutate: async symbol => {
      await queryClient.cancelQueries({ queryKey: ['watchlist'] });
      const previous = queryClient.getQueryData<WatchlistItem[]>(['watchlist']);
      queryClient.setQueryData<WatchlistItem[]>(['watchlist'], (old = []) =>
        old.filter(item => item.symbol !== symbol)
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

  const renderContent = () => {
    if (status === 'loading' || isLoading) {
      return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-20 bg-slate-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      );
    }

    if (!session) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 rounded-full bg-slate-800 mb-6">
            <Star className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-300 mb-3">로그인이 필요합니다</h2>
          <p className="text-slate-500 mb-6 leading-relaxed">
            관심종목을 저장하고
            <br />
            빠르게 확인하세요
          </p>
          <button
            onClick={() => signIn('google')}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Google로 로그인
          </button>
        </div>
      );
    }

    if (watchlist.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 rounded-full bg-yellow-500/10 mb-6">
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-300 mb-3">관심종목이 없습니다</h2>
          <p className="text-slate-500 mb-6 leading-relaxed">
            종목 페이지에서 별 아이콘을 눌러
            <br />
            관심종목을 추가해보세요
          </p>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
          >
            종목 검색하러 가기
          </Link>
        </div>
      );
    }

    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {watchlist.map(item => (
          <div
            key={item.symbol}
            className="group flex items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all"
          >
            <Link href={`/stock/${item.symbol}`} className="flex-1 min-w-0">
              <div className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">
                {item.symbol}
              </div>
              {item.company_name && (
                <div className="text-sm text-slate-400 truncate mt-0.5">{item.company_name}</div>
              )}
            </Link>
            <button
              onClick={() => removeMutation.mutate(item.symbol)}
              className="p-2 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-red-400 transition-colors ml-2 flex-shrink-0"
              title="관심종목에서 제거"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
      <header className="border-b border-slate-800 bg-black/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="h-5 w-px bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <h1 className="text-lg font-bold">관심종목</h1>
              {session && !isLoading && watchlist.length > 0 && (
                <span className="text-sm text-slate-500">({watchlist.length})</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Logo />
            <AuthButton />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{renderContent()}</div>
    </main>
  );
}
