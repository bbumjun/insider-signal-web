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

          <section className="bg-slate-900/40 border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
            <div className="flex gap-4 mt-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 min-h-[350px] sm:min-h-[400px]">
                <Skeleton className="h-6 w-28 mb-4" />
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
                <div className="mt-6 space-y-4">
                  <Skeleton className="h-5 w-28" />
                  <div className="flex justify-center items-center gap-8 sm:gap-16 py-4 sm:py-6 px-4 bg-gradient-to-b from-slate-800/40 to-slate-900/40 rounded-xl border border-slate-700/30">
                    <div className="flex flex-col items-center">
                      <Skeleton className="w-[100px] h-[58px] sm:w-[120px] sm:h-[68px] rounded-t-full" />
                      <Skeleton className="h-4 w-8 mt-2" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                    <div className="w-px h-20 bg-gradient-to-b from-transparent via-slate-600 to-transparent" />
                    <div className="flex flex-col items-center">
                      <Skeleton className="w-[100px] h-[58px] sm:w-[120px] sm:h-[68px] rounded-t-full" />
                      <Skeleton className="h-4 w-8 mt-2" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-7 w-7" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
                <div className="h-[250px] flex items-center justify-center">
                  <div className="relative">
                    <div className="w-40 h-40 rounded-full border-2 border-slate-700" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-28 h-28 rounded-full border-2 border-slate-700" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full border-2 border-slate-700" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="text-center">
                      <Skeleton className="h-2.5 w-10 mx-auto mb-1" />
                      <Skeleton className="h-4 w-6 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden">
                <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="divide-y divide-slate-800">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-12 rounded" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-4 w-4" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4 mt-1" />
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-slate-800">
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
