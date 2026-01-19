import { Newspaper, ArrowUpCircle, ArrowDownCircle, Star } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { InsiderTransaction, CompanyNews } from '@/types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ActivityTimelineProps {
  insiderTransactions: InsiderTransaction[];
  news: CompanyNews[];
}

export default function ActivityTimeline({ insiderTransactions, news }: ActivityTimelineProps) {
  const activities = [
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

  if (activities.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center text-slate-500 italic text-sm sm:text-base">
        이 종목의 최근 활동이 없습니다.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-800">
      {activities.map((activity, i) => {
        const isOpenMarketBuy = activity.type === 'insider' && activity.data.transactionCode === 'P';
        const isBuy = activity.type === 'insider' && ['P', 'A', 'M'].includes(activity.data.transactionCode);
        const isSell = activity.type === 'insider' && activity.data.transactionCode === 'S';
        
        return (
          <div key={i} className={cn(
            "p-3 sm:p-4 hover:bg-white/5 transition-colors group cursor-pointer",
            isOpenMarketBuy && "bg-emerald-500/5 border-l-2 border-emerald-500"
          )}>
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
              {activity.type === 'insider' ? (
                isBuy ? <ArrowUpCircle className={cn("w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0", isOpenMarketBuy ? "text-yellow-400" : "text-emerald-400")} /> : <ArrowDownCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-red-400 flex-shrink-0" />
              ) : (
                <Newspaper className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-blue-400 flex-shrink-0" />
              )}
            </div>
            <h4 className={cn(
              "text-xs sm:text-sm font-medium leading-snug group-hover:text-white transition-colors line-clamp-2",
              isOpenMarketBuy ? "text-emerald-300" : "text-slate-200"
            )}>
              {activity.type === 'insider' 
                ? `${activity.data.name} ${Number(activity.data.share).toLocaleString()}주`
                : activity.data.headline}
            </h4>
            {activity.type === 'insider' && (
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
                {isOpenMarketBuy ? '공개시장 매수' : activity.data.transactionCode === 'M' ? '옵션 행사' : activity.data.transactionCode === 'A' ? '주식 수여' : '공개시장 매도'} · ${activity.data.transactionPrice?.toLocaleString() || 0}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
