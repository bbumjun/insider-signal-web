'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import Link from 'next/link';
import { EarningsEvent } from '@/types';

// 날짜 유틸리티
function getWeekDates(baseDate: Date): Date[] {
  const dates: Date[] = [];
  const startOfWeek = new Date(baseDate);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // 월요일 시작
  startOfWeek.setDate(diff);

  for (let i = 0; i < 5; i++) {
    // 월~금
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    dates.push(date);
  }
  return dates;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDisplayDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  return `${month}/${day} (${dayNames[date.getDay()]})`;
}

function getWeekLabel(dates: Date[]): string {
  const first = dates[0];
  const last = dates[dates.length - 1];
  const firstMonth = first.getMonth() + 1;
  const lastMonth = last.getMonth() + 1;

  if (firstMonth === lastMonth) {
    return `${first.getFullYear()}년 ${firstMonth}월 ${first.getDate()}일 - ${last.getDate()}일`;
  }
  return `${first.getFullYear()}년 ${firstMonth}월 ${first.getDate()}일 - ${lastMonth}월 ${last.getDate()}일`;
}

function HourBadge({ hour }: { hour: string }) {
  if (hour === 'bmo') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">
        <Clock className="w-3 h-3" />장 전
      </span>
    );
  }
  if (hour === 'amc') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
        <Clock className="w-3 h-3" />장 후
      </span>
    );
  }
  return null;
}

function EpsIndicator({ estimate, actual }: { estimate: number | null; actual: number | null }) {
  if (actual === null) {
    return estimate !== null ? (
      <span className="text-slate-400 text-xs">예상 ${estimate.toFixed(2)}</span>
    ) : null;
  }

  if (estimate === null) {
    return <span className="text-slate-300 text-sm">${actual.toFixed(2)}</span>;
  }

  const beat = actual > estimate;
  const miss = actual < estimate;

  return (
    <div className="flex items-center gap-1">
      <span
        className={`text-sm font-medium ${beat ? 'text-emerald-400' : miss ? 'text-red-400' : 'text-slate-300'}`}
      >
        ${actual.toFixed(2)}
      </span>
      {beat && <TrendingUp className="w-3 h-3 text-emerald-400" />}
      {miss && <TrendingDown className="w-3 h-3 text-red-400" />}
      {!beat && !miss && <Minus className="w-3 h-3 text-slate-500" />}
      <span className="text-xs text-slate-500">(예상 ${estimate.toFixed(2)})</span>
    </div>
  );
}

function EarningsCard({ event }: { event: EarningsEvent }) {
  const hasActual = event.epsActual !== null;

  return (
    <Link
      href={`/stock/${event.symbol}`}
      className={`block p-3 rounded-lg border transition-all hover:scale-[1.02] ${
        hasActual
          ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">{event.symbol}</span>
          <HourBadge hour={event.hour} />
        </div>
        {event.quarter && event.year && (
          <span className="text-xs text-slate-500">
            Q{event.quarter} {event.year}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">EPS</span>
          <EpsIndicator estimate={event.epsEstimate} actual={event.epsActual} />
        </div>

        {(event.revenueEstimate || event.revenueActual) && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">매출</span>
            <span className="text-xs text-slate-400">
              {event.revenueActual
                ? `$${(event.revenueActual / 1e9).toFixed(2)}B`
                : event.revenueEstimate
                  ? `예상 $${(event.revenueEstimate / 1e9).toFixed(2)}B`
                  : null}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function EarningsCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [earnings, setEarnings] = useState<EarningsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const weekDates = getWeekDates(currentDate);
  const weekLabel = getWeekLabel(weekDates);

  useEffect(() => {
    async function fetchEarnings() {
      setLoading(true);
      setError(null);

      const from = formatDate(weekDates[0]);
      const to = formatDate(weekDates[weekDates.length - 1]);

      try {
        const res = await fetch(`/api/earnings?from=${from}&to=${to}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setEarnings(data.earnings || []);
      } catch (e) {
        console.error(e);
        setError('실적 데이터를 불러오는데 실패했습니다');
      } finally {
        setLoading(false);
      }
    }

    fetchEarnings();
  }, [currentDate]);

  const goToPrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToThisWeek = () => {
    setCurrentDate(new Date());
  };

  // 날짜별로 실적 그룹화
  const earningsByDate = weekDates.reduce(
    (acc, date) => {
      const dateStr = formatDate(date);
      acc[dateStr] = earnings.filter(e => e.date === dateStr);
      return acc;
    },
    {} as Record<string, EarningsEvent[]>
  );

  return (
    <div className="space-y-6">
      {/* 헤더 네비게이션 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPrevWeek}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-lg font-semibold">{weekLabel}</h2>
          </div>

          <button
            onClick={goToNextWeek}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={goToThisWeek}
          className="px-3 py-1.5 text-sm bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors"
        >
          이번 주
        </button>
      </div>

      {/* 캘린더 그리드 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {weekDates.map(date => (
            <div key={formatDate(date)} className="space-y-3">
              <div className="h-6 bg-slate-800 rounded animate-pulse" />
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-slate-800/50 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">
          <p>{error}</p>
          <button
            onClick={() => setCurrentDate(new Date(currentDate))}
            className="mt-4 text-sm text-emerald-400 hover:underline"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {weekDates.map(date => {
            const dateStr = formatDate(date);
            const dayEarnings = earningsByDate[dateStr] || [];
            const isToday = formatDate(new Date()) === dateStr;

            return (
              <div key={dateStr} className="space-y-3">
                <div
                  className={`text-sm font-medium px-2 py-1 rounded ${
                    isToday ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {formatDisplayDate(date)}
                  {dayEarnings.length > 0 && (
                    <span className="ml-2 text-xs text-slate-500">({dayEarnings.length})</span>
                  )}
                </div>

                <div className="space-y-2 min-h-[200px]">
                  {dayEarnings.length === 0 ? (
                    <div className="text-center py-8 text-slate-600 text-sm">예정된 실적 없음</div>
                  ) : (
                    dayEarnings
                      .sort((a, b) => {
                        const hourOrder = { bmo: 0, dmh: 1, amc: 2, '': 3 };
                        const hourDiff =
                          (hourOrder[a.hour as keyof typeof hourOrder] || 3) -
                          (hourOrder[b.hour as keyof typeof hourOrder] || 3);
                        if (hourDiff !== 0) return hourDiff;
                        return (b.marketCap || 0) - (a.marketCap || 0);
                      })
                      .map((event, idx) => (
                        <EarningsCard key={`${event.symbol}-${idx}`} event={event} />
                      ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 범례 */}
      <div className="flex items-center gap-6 text-xs text-slate-500 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-amber-500/20" />
          <span>장 전 (BMO)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-purple-500/20" />
          <span>장 후 (AMC)</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          <span>예상치 상회</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingDown className="w-3 h-3 text-red-400" />
          <span>예상치 하회</span>
        </div>
      </div>
    </div>
  );
}
