import { NextResponse } from 'next/server';
import { withCache } from '@/lib/cache/supabaseCache';
import { searchKoreanStocksAsync, hasKoreanCharacters } from '@/lib/data/koreanStockSearch';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const API_KEY = process.env.FINNHUB_API_KEY;

const CACHE_TTL_HOURS = 24;

interface SearchResult {
  symbol: string;
  description: string;
  displaySymbol: string;
  type: string;
}

async function searchFinnhub(query: string): Promise<SearchResult[]> {
  const response = await fetch(
    `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(query)}&token=${API_KEY}`
  );

  if (!response.ok) return [];

  const data = await response.json();
  
  const seen = new Set<string>();
  return (data.result || [])
    .filter((item: SearchResult) => {
      if (item.type !== 'Common Stock' || item.symbol.includes('.')) return false;
      if (seen.has(item.symbol)) return false;
      seen.add(item.symbol);
      return true;
    })
    .slice(0, 8);
}

async function searchSymbolsRaw(query: string): Promise<SearchResult[]> {
  const koreanStocks = searchKoreanStocksAsync(query);
  const koreanResults = koreanStocks.map((stock) => ({
    symbol: stock.symbol,
    description: `${stock.nameKr} (${stock.nameEn})`,
    displaySymbol: stock.symbol,
    type: 'Common Stock',
  }));

  if (hasKoreanCharacters(query)) {
    return koreanResults;
  }

  const finnhubResults = await searchFinnhub(query);
  
  const seen = new Set(koreanResults.map((r) => r.symbol));
  const mergedResults = [
    ...koreanResults,
    ...finnhubResults.filter((r) => !seen.has(r.symbol)),
  ];

  return mergedResults.slice(0, 10);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 1) {
    return NextResponse.json({ result: [] });
  }

  const cacheKey = `search:${query.toLowerCase()}`;
  const result = await withCache(
    cacheKey,
    () => searchSymbolsRaw(query),
    { ttlMinutes: CACHE_TTL_HOURS * 60 }
  );

  return NextResponse.json({ result });
}
