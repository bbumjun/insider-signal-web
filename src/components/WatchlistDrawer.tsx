'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Star,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  LogIn,
} from 'lucide-react';

interface WatchlistQuote {
  symbol: string;
  companyName: string | null;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  marketState: string | null;
}

const REFRESH_INTERVAL = 15000;

export default function WatchlistDrawer() {
  const { data: session } = useSession();
  const [quotes, setQuotes] = useState<WatchlistQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트 마운트 후 화면 크기에 따라 초기 상태 설정
  useEffect(() => {
    setIsMounted(true);
    // 모바일 (768px 미만)에서는 기본 닫힘
    const isMobile = window.innerWidth < 768;
    setIsOpen(!isMobile);

    // localStorage에서 사용자 설정 불러오기 (있는 경우)
    const saved = localStorage.getItem('watchlist-drawer-open');
    if (saved !== null) {
      setIsOpen(saved === 'true');
    }
  }, []);

  // 열림/닫힘 상태 저장
  const toggleDrawer = useCallback(() => {
    setIsOpen(prev => {
      const newState = !prev;
      localStorage.setItem('watchlist-drawer-open', String(newState));
      return newState;
    });
  }, []);

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

  // 서버 렌더링 시 숨김 (hydration mismatch 방지)
  if (!isMounted) {
    return null;
  }

  return (
    <>
      <button
        onClick={toggleDrawer}
        className={`fixed top-16 z-[60] flex items-center justify-center w-8 h-10 bg-slate-800 hover:bg-slate-700 border border-slate-700 border-r-0 rounded-l-lg transition-all duration-300 ${
          isOpen ? 'right-[280px]' : 'right-0'
        }`}
        title={isOpen ? '관심종목 닫기' : '관심종목 열기'}
      >
        {isOpen ? (
          <ChevronRight className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-amber-400" />
        )}
        {!isOpen && quotes.length > 0 && (
          <span className="absolute -top-2 -left-2 w-5 h-5 bg-amber-500 text-[10px] font-bold text-slate-900 rounded-full flex items-center justify-center">
            {quotes.length}
          </span>
        )}
      </button>

      {/* Drawer 본체 */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-slate-900/95 backdrop-blur-sm border-l border-slate-800 z-[55] transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col p-4 overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="font-medium">관심종목</span>
              {session && quotes.length > 0 && (
                <span className="text-xs text-slate-500">({quotes.length})</span>
              )}
            </div>
            {session && (
              <button
                onClick={fetchQuotes}
                className="p-1.5 hover:bg-slate-800 rounded transition-colors"
                title="새로고침"
              >
                <RefreshCw className="w-4 h-4 text-slate-500" />
              </button>
            )}
          </div>

          {/* 콘텐츠 영역 */}
          <div className="flex-1 overflow-y-auto">
            {!session ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <LogIn className="w-8 h-8 text-slate-600 mb-3" />
                <p className="text-sm text-slate-500 mb-2">로그인 후 이용 가능합니다</p>
                <p className="text-xs text-slate-600">
                  관심 종목을 추가하고 실시간 시세를 확인하세요
                </p>
              </div>
            ) : loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-14 bg-slate-800/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : quotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <Star className="w-8 h-8 text-slate-600 mb-3" />
                <p className="text-sm text-slate-500 mb-2">관심종목을 추가해보세요</p>
                <p className="text-xs text-slate-600">
                  종목 페이지에서 별 아이콘을 클릭하면 추가됩니다
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {quotes.map(quote => (
                  <Link
                    key={quote.symbol}
                    href={`/stock/${quote.symbol}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm group-hover:text-blue-400 transition-colors">
                        {quote.symbol}
                      </div>
                      {quote.companyName && (
                        <div className="text-xs text-slate-500 truncate max-w-[120px]">
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
            )}
          </div>

          {/* 푸터 - 마지막 업데이트 시간 */}
          {session && lastUpdated && quotes.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-800">
              <div className="text-[10px] text-slate-600 text-center">
                {lastUpdated.toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}{' '}
                업데이트 (15초 자동)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 모바일에서 drawer 열렸을 때 배경 오버레이 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={toggleDrawer} />
      )}
    </>
  );
}
