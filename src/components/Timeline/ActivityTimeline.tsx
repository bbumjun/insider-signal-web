'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Newspaper, ArrowUpCircle, ArrowDownCircle, Star, ChevronDown, ExternalLink, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { InsiderTransaction, CompanyNews } from '@/types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ActivityTimelineProps {
  insiderTransactions: InsiderTransaction[];
  news: CompanyNews[];
  limit?: number;
  showMoreLink?: string;
  initialExpandDate?: string;
}

function formatValue(v: number) {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

function getTransactionTypeLabel(code: string) {
  switch (code) {
    case 'P': return '공개시장 매수';
    case 'S': return '공개시장 매도';
    case 'M': return '스톡옵션 행사';
    case 'A': return '주식 수여';
    case 'F': return '세금 납부용 매도';
    case 'G': return '증여';
    default: return code;
  }
}

function getTransactionDescription(code: string) {
  switch (code) {
    case 'P': return '내부자가 자기 돈으로 공개시장에서 직접 매수한 거래입니다. 가장 강력한 긍정 시그널로 평가됩니다.';
    case 'S': return '내부자가 공개시장에서 주식을 매도한 거래입니다. 현금화 목적이거나 고점 인식일 수 있습니다.';
    case 'M': return '스톡옵션을 행사하여 주식을 취득한 거래입니다. 행사 후 보유/매도 패턴이 중요합니다.';
    case 'A': return '회사로부터 주식을 보상으로 수여받은 거래입니다.';
    case 'F': return '세금 납부를 위해 매도한 거래로, 투자 시그널로 보기 어렵습니다.';
    case 'G': return '주식을 타인에게 증여한 거래입니다.';
    default: return '';
  }
}

function cleanSummaryText(text: string) {
  return text
    .replace(/â€[^a-zA-Z]*/g, '...')
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function ActivityTimeline({ insiderTransactions, news, limit, showMoreLink, initialExpandDate }: ActivityTimelineProps) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const allActivities = [
    ...insiderTransactions.map((t) => ({
      type: 'insider' as const,
      date: t.transactionDate,
      data: t,
    })),
    ...news.map((n) => ({
      type: 'news' as const,
      date: n.datetime ? new Date(n.datetime * 1000).toISOString().split('T')[0] : n.publishedAt?.split('T')[0] || '',
      data: n,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const activities = limit ? allActivities.slice(0, limit) : allActivities;
  const hasMore = limit ? allActivities.length > limit : false;

  const getInitialExpandIndex = () => {
    if (!initialExpandDate) return null;
    const index = activities.findIndex((a) => a.date === initialExpandDate);
    return index !== -1 ? index : null;
  };

  const [expandedIndex, setExpandedIndex] = useState<number | null>(getInitialExpandIndex);

  useEffect(() => {
    if (initialExpandDate && expandedIndex !== null) {
      const timeoutId = setTimeout(() => {
        itemRefs.current[expandedIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, []);

  if (activities.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center text-slate-500 italic text-sm sm:text-base">
        이 종목의 최근 활동이 없습니다.
      </div>
    );
  }

  const handleClick = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="divide-y divide-slate-800">
      {activities.map((activity, i) => {
        const isOpenMarketBuy = activity.type === 'insider' && activity.data.transactionCode === 'P';
        const isBuy = activity.type === 'insider' && ['P', 'A', 'M'].includes(activity.data.transactionCode);
        const isExpanded = expandedIndex === i;
        
        return (
          <div 
            key={i} 
            ref={(el) => { itemRefs.current[i] = el; }}
            className={cn(
              "transition-colors",
              isOpenMarketBuy && "bg-emerald-500/5 border-l-2 border-emerald-500"
            )}
          >
            <button
              onClick={() => handleClick(i)}
              className={cn(
                "w-full p-3 sm:p-4 text-left hover:bg-white/5 transition-colors",
                isExpanded && "bg-white/5"
              )}
            >
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className={cn(
                    "text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded border font-medium tracking-wider uppercase whitespace-nowrap",
                    activity.type === 'insider' 
                      ? isBuy ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  )}>
                    {activity.type === 'insider' 
                      ? isBuy ? '매수' : '매도'
                      : '뉴스'}
                  </span>
                  {isOpenMarketBuy && (
                    <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold flex items-center gap-0.5 whitespace-nowrap">
                      <Star className="w-2.5 sm:w-3 h-2.5 sm:h-3 fill-yellow-400" />
                      강력
                    </span>
                  )}
                  <span className="text-slate-500 text-[10px] sm:text-xs whitespace-nowrap">{activity.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {activity.type === 'insider' ? (
                    isBuy ? <ArrowUpCircle className={cn("w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0", isOpenMarketBuy ? "text-yellow-400" : "text-emerald-400")} /> : <ArrowDownCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-red-400 flex-shrink-0" />
                  ) : (
                    <Newspaper className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-blue-400 flex-shrink-0" />
                  )}
                  <ChevronDown className={cn(
                    "w-3.5 sm:w-4 h-3.5 sm:h-4 text-slate-500 transition-transform",
                    isExpanded && "rotate-180"
                  )} />
                </div>
              </div>
              <h4 className={cn(
                "text-xs sm:text-sm font-medium leading-snug transition-colors line-clamp-2",
                isOpenMarketBuy ? "text-emerald-300" : "text-slate-200"
              )}>
                {activity.type === 'insider' 
                  ? `${activity.data.name} ${Number(activity.data.share).toLocaleString()}주`
                  : activity.data.headline}
              </h4>
              {activity.type === 'insider' && (
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
                  {getTransactionTypeLabel(activity.data.transactionCode)} · ${activity.data.transactionPrice?.toLocaleString() || 0}
                </p>
              )}
            </button>

            {isExpanded && (
              <div className="mx-3 sm:mx-4 mb-3 sm:mb-4 animate-in slide-in-from-top-2 duration-200">
                <div className="bg-slate-800/50 rounded-lg p-3 sm:p-4 space-y-3 border border-slate-700/50">
                  {activity.type === 'insider' ? (
                    <>
                      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                        <div>
                          <span className="text-slate-500 block mb-0.5">거래 유형</span>
                          <span className="text-slate-200">{getTransactionTypeLabel(activity.data.transactionCode)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-0.5">거래 금액</span>
                          <span className="text-slate-200">{formatValue(activity.data.share * (activity.data.transactionPrice || 0))}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-0.5">주식 수</span>
                          <span className="text-slate-200">{Number(activity.data.share).toLocaleString()}주</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-0.5">주당 가격</span>
                          <span className="text-slate-200">${activity.data.transactionPrice?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-700">
                        <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed">
                          {getTransactionDescription(activity.data.transactionCode)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      {activity.data.summary && (
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-4">
                          {cleanSummaryText(activity.data.summary)}
                        </p>
                      )}
                      {activity.data.url && (
                        <a
                          href={activity.data.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs sm:text-sm bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg transition-colors border border-blue-500/20"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          원문 보기
                        </a>
                      )}
                      {!activity.data.summary && !activity.data.url && (
                        <p className="text-xs text-slate-500 italic">추가 정보가 없습니다.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {hasMore && showMoreLink && (
        <Link
          href={showMoreLink}
          className="flex items-center justify-center gap-2 p-4 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
        >
          <span>더보기</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
