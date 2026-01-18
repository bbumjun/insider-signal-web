'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const PERIODS = ['1M', '3M', '1Y'] as const;

interface PeriodSelectorProps {
  currentPeriod: string;
}

export default function PeriodSelector({ currentPeriod }: PeriodSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePeriodChange = (period: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', period);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex gap-2">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => handlePeriodChange(p)}
          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors border ${
            currentPeriod === p
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
              : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
