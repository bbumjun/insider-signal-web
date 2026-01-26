import { ChevronLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import EarningsCalendar from '@/components/EarningsCalendar';
import SearchBar from '@/components/SearchBar';
import AuthButton from '@/components/AuthButton';
import Logo from '@/components/Logo';

export const metadata = {
  title: '실적 캘린더 | Insider Signal',
  description: '미국 주식 실적 발표 일정을 확인하세요. EPS 예상치와 실제 결과를 비교합니다.',
};

export default function EarningsPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
      {/* 헤더 */}
      <header className="border-b border-slate-800 bg-black/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className="p-1.5 sm:p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div className="h-5 sm:h-6 w-px bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <h1 className="text-base sm:text-xl font-bold">실적 캘린더</h1>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <div className="hidden sm:block">
              <SearchBar compact />
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* 소개 섹션 */}
        <div className="mb-8">
          <p className="text-slate-400">
            미국 주식 실적 발표 일정입니다. 종목을 클릭하면 상세 분석 페이지로 이동합니다.
          </p>
        </div>

        {/* 캘린더 */}
        <EarningsCalendar />
      </div>
    </main>
  );
}
