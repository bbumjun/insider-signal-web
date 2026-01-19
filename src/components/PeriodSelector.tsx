'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useState } from 'react';
import { Loader2 } from 'lucide-react';

const PERIODS = ['1M', '3M', '1Y', '5Y'] as const;

const PERIOD_LABELS: Record<string, string> = {
  '1M': '1개월',
  '3M': '3개월',
  '1Y': '1년',
  '5Y': '5년',
};

interface PeriodSelectorProps {
  currentPeriod: string;
}

export default function PeriodSelector({ currentPeriod }: PeriodSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [pendingPeriod, setPendingPeriod] = useState<string | null>(null);

  const handlePeriodChange = (period: string) => {
    if (period === currentPeriod || isPending) return;
    
    setPendingPeriod(period);
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', period);
    
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="flex gap-2">
      {PERIODS.map((p) => {
        const isLoading = isPending && pendingPeriod === p;
        const isActive = currentPeriod === p && !isPending;
        const isDisabled = isPending && pendingPeriod !== p;
        
        return (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            disabled={isPending}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all border flex items-center gap-1.5 ${
              isLoading
                ? 'bg-emerald-500/30 border-emerald-500/50 text-emerald-400'
                : isActive
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                : isDisabled
                ? 'bg-slate-800/50 border-slate-700/50 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 cursor-pointer'
            }`}
          >
            {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
            {PERIOD_LABELS[p]}
          </button>
        );
      })}
    </div>
  );
}
