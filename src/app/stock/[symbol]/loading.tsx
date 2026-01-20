import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-800 rounded ${className}`} />;
}

export default function StockLoading() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-slate-800 bg-black/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="h-6 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-32 hidden sm:block" />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="h-9 w-32 hidden sm:block rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          <section className="bg-slate-900/40 border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
              <Skeleton className="h-6 w-16" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-[300px] sm:h-[350px] lg:h-[400px] w-full rounded-xl" />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            <div className="lg:col-span-5">
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl sm:rounded-2xl p-4 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <Skeleton className="h-6 w-28 mb-4" />
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl sm:rounded-2xl p-6 min-h-[350px] sm:min-h-[400px]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
