import { Newspaper, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
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
      <div className="p-12 text-center text-slate-500 italic">
        이 종목의 최근 활동이 없습니다.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-800">
      {activities.map((activity, i) => {
        const isBuy = activity.type === 'insider' && ['P', 'A', 'M'].includes(activity.data.transactionCode);
        const isSell = activity.type === 'insider' && activity.data.transactionCode === 'S';
        
        return (
          <div key={i} className="p-4 hover:bg-white/5 transition-colors group cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded border font-medium tracking-wider uppercase",
                  activity.type === 'insider' 
                    ? isBuy ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                )}>
                  {activity.type === 'insider' 
                    ? isBuy ? '내부자 매수' : '내부자 매도'
                    : '뉴스'}
                </span>
                <span className="text-slate-500 text-xs">{activity.date}</span>
              </div>
              {activity.type === 'insider' ? (
                isBuy ? <ArrowUpCircle className="w-4 h-4 text-emerald-400" /> : <ArrowDownCircle className="w-4 h-4 text-red-400" />
              ) : (
                <Newspaper className="w-4 h-4 text-blue-400" />
              )}
            </div>
            <h4 className="text-sm font-medium text-slate-200 leading-snug group-hover:text-white transition-colors">
              {activity.type === 'insider' 
                ? `${activity.data.name} ${isBuy ? '매수' : '매도'} ${Number(activity.data.share).toLocaleString()}주`
                : activity.data.headline}
            </h4>
            {activity.type === 'insider' && (
              <p className="text-xs text-slate-500 mt-1">
                가격: ${activity.data.transactionPrice} | 코드: {activity.data.transactionCode}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
