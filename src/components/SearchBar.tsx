'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';

interface SearchResult {
  symbol: string;
  description: string;
  displaySymbol: string;
  type: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isSelectingRef = useRef(false);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }

    if (query.length < 1) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);
    
    debounceRef.current = setTimeout(async () => {
      abortControllerRef.current = new AbortController();
      
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: abortControllerRef.current.signal,
        });
        const data = await res.json();
        setResults(data.result || []);
        setIsOpen(data.result?.length > 0);
        setSelectedIndex(-1);
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') {
          console.error('Search error:', e);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    isSelectingRef.current = true;
    setQuery(symbol);
    setResults([]);
    setIsOpen(false);
    setIsLoading(false);
    setIsNavigating(true);
    router.push(`/stock/${symbol}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && results[selectedIndex]) {
      handleSelect(results[selectedIndex].symbol);
    } else if (query.trim()) {
      setIsNavigating(true);
      router.push(`/stock/${query.trim().toUpperCase()}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="종목 코드 입력 (예: AAPL, NVDA)..."
          className="w-full h-12 sm:h-14 pl-10 sm:pl-12 pr-20 sm:pr-24 rounded-xl sm:rounded-2xl bg-slate-900/50 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm sm:text-base"
        />
        {isLoading ? (
          <Loader2 className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
        ) : (
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 sm:w-5 h-4 sm:h-5" />
        )}
        <button
          type="submit"
          disabled={isNavigating}
          className="absolute right-1.5 sm:right-2 top-1.5 sm:top-2 bottom-1.5 sm:bottom-2 px-4 sm:px-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white rounded-lg sm:rounded-xl font-semibold transition-colors text-sm sm:text-base flex items-center gap-2"
        >
          {isNavigating && <Loader2 className="w-4 h-4 animate-spin" />}
          분석
        </button>
      </form>

      {isOpen && (
        <ul className="absolute z-50 w-full mt-2 py-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <li key={i} className="px-4 py-3 flex items-center gap-4 animate-pulse">
                <div className="h-5 w-14 bg-slate-700 rounded" />
                <div className="h-4 flex-1 bg-slate-800 rounded" />
              </li>
            ))
          ) : results.length > 0 ? (
            results.map((item, index) => (
              <li key={item.symbol}>
                <button
                  type="button"
                  onClick={() => handleSelect(item.symbol)}
                  className={`w-full px-4 py-3 flex items-center gap-4 text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'hover:bg-slate-800'
                  }`}
                >
                  <span className="font-bold text-white min-w-[60px]">{item.displaySymbol}</span>
                  <span className="text-slate-400 text-sm truncate">{item.description}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-slate-500 text-sm text-center">
              검색 결과가 없습니다
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
