'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Clock, X } from 'lucide-react';

interface SearchResult {
  symbol: string;
  description: string;
  displaySymbol: string;
  type: string;
}

interface RecentSearch {
  symbol: string;
  description: string;
  timestamp: number;
}

const RECENT_SEARCHES_KEY = 'insider-signal-recent-searches';
const MAX_RECENT_SEARCHES = 5;

function getRecentSearches(): RecentSearch[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(symbol: string, description: string) {
  const searches = getRecentSearches().filter(s => s.symbol !== symbol);
  const newSearches = [{ symbol, description, timestamp: Date.now() }, ...searches].slice(0, MAX_RECENT_SEARCHES);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
}

function removeRecentSearch(symbol: string) {
  const searches = getRecentSearches().filter(s => s.symbol !== symbol);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
}

interface SearchBarProps {
  compact?: boolean;
}

export default function SearchBar({ compact = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isSelectingRef = useRef(false);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const refreshRecentSearches = useCallback(() => {
    setRecentSearches(getRecentSearches());
  }, []);

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
      if (recentSearches.length > 0) {
        setShowRecent(true);
      }
      return;
    }

    setShowRecent(false);
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
        setShowRecent(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol: string, description?: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    isSelectingRef.current = true;
    setQuery(symbol);
    setResults([]);
    setIsOpen(false);
    setShowRecent(false);
    setIsLoading(false);
    saveRecentSearch(symbol, description || symbol);
    refreshRecentSearches();
    router.push(`/stock/${symbol}`);
  };

  const handleRemoveRecent = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    removeRecentSearch(symbol);
    refreshRecentSearches();
  };

  const handleFocus = () => {
    if (query.length === 0 && recentSearches.length > 0) {
      setShowRecent(true);
      setIsOpen(false);
    } else if (results.length > 0) {
      setIsOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showRecent && selectedIndex >= 0 && recentSearches[selectedIndex]) {
      handleSelect(recentSearches[selectedIndex].symbol, recentSearches[selectedIndex].description);
    } else if (selectedIndex >= 0 && results[selectedIndex]) {
      handleSelect(results[selectedIndex].symbol, results[selectedIndex].description);
    } else if (query.trim()) {
      const symbol = query.trim().toUpperCase();
      saveRecentSearch(symbol, symbol);
      router.push(`/stock/${symbol}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const listLength = showRecent ? recentSearches.length : results.length;
    if ((!isOpen && !showRecent) || listLength === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < listLength - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setShowRecent(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${compact ? 'w-full max-w-xs' : 'w-full max-w-xl mx-auto'}`}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={compact ? "종목 검색..." : "종목 검색 (예: 애플, NVDA, 테슬라)..."}
          className={`w-full ${compact ? 'h-9 pl-8 pr-3 rounded-lg text-sm' : 'h-12 sm:h-14 pl-10 sm:pl-12 pr-20 sm:pr-24 rounded-xl sm:rounded-2xl text-sm sm:text-base'} bg-slate-900/50 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
        />
        {isLoading ? (
          <Loader2 className={`absolute ${compact ? 'left-2.5 w-4 h-4' : 'left-3 sm:left-4 w-4 sm:w-5 h-4 sm:h-5'} top-1/2 -translate-y-1/2 text-slate-500 animate-spin`} />
        ) : (
          <Search className={`absolute ${compact ? 'left-2.5 w-4 h-4' : 'left-3 sm:left-4 w-4 sm:w-5 h-4 sm:h-5'} top-1/2 -translate-y-1/2 text-slate-500`} />
        )}
        {!compact && (
          <button
            type="submit"
            className="absolute right-1.5 sm:right-2 top-1.5 sm:top-2 bottom-1.5 sm:bottom-2 px-4 sm:px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg sm:rounded-xl font-semibold transition-colors text-sm sm:text-base"
          >
            분석
          </button>
        )}
      </form>

      {showRecent && recentSearches.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 py-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
          <li className="px-4 py-2 text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            최근 검색
          </li>
          {recentSearches.map((item, index) => (
            <li key={item.symbol}>
              <button
                type="button"
                onClick={() => handleSelect(item.symbol, item.description)}
                className={`w-full px-4 py-3 flex items-center gap-4 text-left transition-colors group ${
                  index === selectedIndex
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'hover:bg-slate-800'
                }`}
              >
                <span className="font-bold text-white min-w-[60px]">{item.symbol}</span>
                <span className="text-slate-400 text-sm truncate flex-1">{item.description}</span>
                <span
                  role="button"
                  onClick={(e) => handleRemoveRecent(e, item.symbol)}
                  className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

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
                  onClick={() => handleSelect(item.symbol, item.description)}
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
