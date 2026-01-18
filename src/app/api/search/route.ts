import { NextResponse } from 'next/server';
import { withCache } from '@/lib/cache/supabaseCache';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const API_KEY = process.env.FINNHUB_API_KEY;

const CACHE_TTL_HOURS = 24;

interface SearchResult {
  symbol: string;
  description: string;
  displaySymbol: string;
  type: string;
}

async function searchSymbolsRaw(query: string): Promise<SearchResult[]> {
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
