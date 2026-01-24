import { ChevronLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';
import FundamentalsClient from './FundamentalsClient';

interface FundamentalsPageProps {
  params: Promise<{ symbol: string }>;
}

export default async function FundamentalsPage({ params }: FundamentalsPageProps) {
  const { symbol } = await params;

  return (
    <main className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
      <header className="border-b border-slate-800 bg-black/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center gap-4">
          <Link
            href={`/stock/${symbol}`}
            className="p-1.5 sm:p-2 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <div className="h-5 sm:h-6 w-px bg-slate-800 flex-shrink-0" />
          <div>
            <h1 className="text-base sm:text-xl font-bold">{symbol}</h1>
            <p className="text-xs text-slate-400">실적 추세 분석</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <FundamentalsClient symbol={symbol} />
      </div>
    </main>
  );
}
