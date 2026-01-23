import { ChevronLeft } from 'lucide-react';

function TimelineItemSkeleton() {
  return (
    <div className="p-3 sm:p-4">
      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-4 w-10 bg-slate-700 rounded animate-pulse" />
          <div className="h-3 w-16 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 sm:w-4 h-3.5 sm:h-4 bg-slate-700 rounded-full animate-pulse" />
          <div className="w-3.5 sm:w-4 h-3.5 sm:h-4 bg-slate-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-4 w-3/4 bg-slate-700 rounded animate-pulse mb-1" />
      <div className="h-3 w-1/3 bg-slate-800 rounded animate-pulse" />
    </div>
  );
}

export default function TimelineLoading() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-slate-800 bg-black/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center">
          <div className="p-1.5 sm:p-2 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0 mr-3">
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="h-5 w-32 bg-slate-700 rounded animate-pulse" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
            <div className="flex gap-1">
              {['1M', '3M', '1Y'].map((p) => (
                <div key={p} className="h-7 w-10 bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden divide-y divide-slate-800">
            {[...Array(6)].map((_, i) => (
              <TimelineItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
