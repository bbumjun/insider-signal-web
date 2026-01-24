import { StockPrice, InsiderTransaction, CompanyNews } from '@/types';
import { withCache, getCachedWithoutExpiry, setCachePermanent } from '@/lib/cache/supabaseCache';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const API_KEY = process.env.FINNHUB_API_KEY;

const CACHE_TTL = {
  INSIDER: 60,
  NEWS_FETCH: 60,
};

async function fetchInsiderTransactionsRaw(symbol: string): Promise<InsiderTransaction[]> {
  const response = await fetch(
    `${FINNHUB_BASE_URL}/stock/insider-transactions?symbol=${symbol}&token=${API_KEY}`
  );
  if (!response.ok) throw new Error('Failed to fetch insider transactions');
  const data = await response.json();
  return data.data || [];
}

async function fetchCompanyNewsRaw(
  symbol: string,
  from: string,
  to: string
): Promise<CompanyNews[]> {
  const response = await fetch(
    `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${API_KEY}`
  );
  if (!response.ok) throw new Error('Failed to fetch company news');
  const data = await response.json();
  return Array.isArray(data) ? data.slice(0, 50) : [];
}

export async function fetchInsiderTransactions(symbol: string): Promise<InsiderTransaction[]> {
  const cacheKey = `insider:${symbol.toUpperCase()}`;
  return withCache(cacheKey, () => fetchInsiderTransactionsRaw(symbol), {
    ttlMinutes: CACHE_TTL.INSIDER,
  });
}

export async function fetchCompanyNews(
  symbol: string,
  from: string,
  to: string
): Promise<CompanyNews[]> {
  const upperSymbol = symbol.toUpperCase();
  const accumulatedKey = `news_accumulated:${upperSymbol}`;
  const lastFetchKey = `news_last_fetch:${upperSymbol}`;

  const lastFetch = await getCachedWithoutExpiry<string>(lastFetchKey);
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  let newNews: CompanyNews[] = [];
  const shouldFetch = !lastFetch || now - new Date(lastFetch).getTime() > oneHour;

  if (shouldFetch) {
    console.log(`[News] Fetching fresh news for ${upperSymbol}`);
    try {
      newNews = await fetchCompanyNewsRaw(symbol, from, to);
      await setCachePermanent(lastFetchKey, new Date().toISOString());
    } catch (e) {
      console.error(`[News] Failed to fetch: ${e}`);
    }
  }

  const existingNews = (await getCachedWithoutExpiry<CompanyNews[]>(accumulatedKey)) || [];

  const newsMap = new Map<string, CompanyNews>();

  [...existingNews, ...newNews].forEach(n => {
    const key = n.url || `${n.datetime}-${n.headline}`;
    if (!newsMap.has(key)) {
      newsMap.set(key, n);
    }
  });

  const mergedNews = Array.from(newsMap.values()).sort(
    (a, b) => (b.datetime || 0) - (a.datetime || 0)
  );

  if (newNews.length > 0) {
    console.log(
      `[News] Accumulated ${mergedNews.length} total news for ${upperSymbol} (+${newNews.length} new)`
    );
    await setCachePermanent(accumulatedKey, mergedNews);
  }

  const fromDate = new Date(from);
  return mergedNews.filter(n => {
    const newsDate = n.datetime ? new Date(n.datetime * 1000) : null;
    return newsDate && newsDate >= fromDate;
  });
}

export async function fetchStockCandles(symbol: string): Promise<StockPrice[]> {
  const to = Math.floor(Date.now() / 1000);
  const from = to - 30 * 24 * 60 * 60;
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
