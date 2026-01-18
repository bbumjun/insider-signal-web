import { StockPrice, InsiderTransaction, CompanyNews } from '@/types';
import { withCache } from '@/lib/cache/supabaseCache';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const API_KEY = process.env.FINNHUB_API_KEY;

const CACHE_TTL = {
  INSIDER: 360,
  NEWS: 60,
};

async function fetchInsiderTransactionsRaw(symbol: string): Promise<InsiderTransaction[]> {
  const response = await fetch(
    `${FINNHUB_BASE_URL}/stock/insider-transactions?symbol=${symbol}&token=${API_KEY}`
  );
  if (!response.ok) throw new Error('Failed to fetch insider transactions');
  const data = await response.json();
  return data.data || [];
}

async function fetchCompanyNewsRaw(symbol: string, from: string, to: string): Promise<CompanyNews[]> {
  const response = await fetch(
    `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${API_KEY}`
  );
  if (!response.ok) throw new Error('Failed to fetch company news');
  const data = await response.json();
  return Array.isArray(data) ? data.slice(0, 50) : [];
}

export async function fetchInsiderTransactions(symbol: string): Promise<InsiderTransaction[]> {
  const cacheKey = `insider:${symbol.toUpperCase()}`;
  return withCache(
    cacheKey,
    () => fetchInsiderTransactionsRaw(symbol),
    { ttlMinutes: CACHE_TTL.INSIDER }
  );
}

export async function fetchCompanyNews(symbol: string, from: string, to: string): Promise<CompanyNews[]> {
  const cacheKey = `news:${symbol.toUpperCase()}:${from}:${to}`;
  return withCache(
    cacheKey,
    () => fetchCompanyNewsRaw(symbol, from, to),
    { ttlMinutes: CACHE_TTL.NEWS }
  );
}

export async function fetchStockCandles(symbol: string): Promise<StockPrice[]> {
  const to = Math.floor(Date.now() / 1000);
  const from = to - (30 * 24 * 60 * 60);
  const response = await fetch(
    `${FINNHUB_BASE_URL}/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${API_KEY}`
  );
  if (!response.ok) throw new Error('Failed to fetch stock candles');
  const data = await response.json();
  
  if (data.s !== 'ok') return [];

  return data.c.map((close: number, i: number) => ({
    date: new Date(data.t[i] * 1000).toISOString().split('T')[0],
    close: close,
  }));
}

