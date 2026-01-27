'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, LineChart } from 'lucide-react';

interface StockPageTabsProps {
  symbol: string;
}

export default function StockPageTabs({ symbol }: StockPageTabsProps) {
  const pathname = usePathname();
  const isAnalysis = pathname === `/stock/${symbol}`;
  const isFundamentals = pathname === `/stock/${symbol}/fundamentals`;

  const tabs = [
    {
      label: '분석',
      href: `/stock/${symbol}`,
      active: isAnalysis,
      icon: LineChart,
    },
    {
      label: '실적',
      href: `/stock/${symbol}/fundamentals`,
      active: isFundamentals,
      icon: BarChart3,
    },
  ];

  return (
    <div className="flex gap-1 p-1 bg-slate-900/60 border border-slate-800 rounded-lg w-fit">
      {tabs.map(tab => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              tab.active
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
