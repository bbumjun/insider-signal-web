'use client';

import { Star } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';

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

export default function WatchlistLink() {
  const { data: session } = useSession();

  const { data: watchlist = [], isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: fetchWatchlist,
    enabled: !!session?.user,
  });

  const count = session && !isLoading ? watchlist.length : 0;

  return (
    <Link
      href="/watchlist"
      className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors"
      title="관심종목"
    >
      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-emerald-500 rounded-full px-1">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
