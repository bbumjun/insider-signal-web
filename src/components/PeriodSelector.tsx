'use client';

type Period = '1M' | '3M' | '1Y';

const PERIODS: Period[] = ['1M', '3M', '1Y'];

const PERIOD_LABELS: Record<Period, string> = {
  '1M': '1개월',
  '3M': '3개월',
  '1Y': '1년',
};

interface PeriodSelectorProps {
  currentPeriod: Period;
  onPeriodChange: (period: Period) => void;
}

export default function PeriodSelector({ currentPeriod, onPeriodChange }: PeriodSelectorProps) {
  return (
    <div className="flex gap-1.5 sm:gap-2">
      {PERIODS.map((p) => {
        const isActive = currentPeriod === p;
        
        return (
          <button
            key={p}
            onClick={() => onPeriodChange(p)}
            className={`px-3 sm:px-4 py-1 sm:py-1.5 text-xs font-bold rounded-lg transition-all border ${
              isActive
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 cursor-pointer'
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        );
      })}
    </div>
  );
}
