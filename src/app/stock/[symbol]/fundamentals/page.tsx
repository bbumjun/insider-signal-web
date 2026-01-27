import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import FundamentalsClient from './FundamentalsClient';
import StockPageTabs from '@/components/StockPageTabs';
import SearchBar from '@/components/SearchBar';
import AuthButton from '@/components/AuthButton';

interface FundamentalsPageProps {
  params: Promise<{ symbol: string }>;
}

export default async function FundamentalsPage({ params }: FundamentalsPageProps) {
  const { symbol } = await params;

  return (
    <main className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
      <header className="border-b border-slate-800 bg-black/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Link
              href="/"
              className="p-1.5 sm:p-2 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div className="h-5 sm:h-6 w-px bg-slate-800 flex-shrink-0 hidden sm:block" />
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold">{symbol}</h1>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            <div className="hidden sm:block">
              <SearchBar compact />
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <StockPageTabs symbol={symbol} />
        </div>
        <FundamentalsClient symbol={symbol} />
      </div>
    </main>
  );
}
