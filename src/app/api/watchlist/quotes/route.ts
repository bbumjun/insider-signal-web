import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export interface WatchlistQuote {
  symbol: string;
  companyName: string | null;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  marketState: string | null;
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();

  const { data: watchlist, error } = await supabase
    .from('watchlist')
    .select('symbol, company_name')
    .eq('user_id', session.user.id)
    .order('added_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!watchlist || watchlist.length === 0) {
    return NextResponse.json({ quotes: [] });
  }

  const symbols = watchlist.map(w => w.symbol);

  try {
    const quotes = await yahooFinance.quote(symbols, {
      fields: [
        'symbol',
        'shortName',
        'regularMarketPrice',
        'regularMarketChange',
        'regularMarketChangePercent',
        'marketState',
      ],
    });

    const quoteMap = new Map<string, WatchlistQuote>();
    for (const q of quotes) {
      if (q.symbol) {
        quoteMap.set(q.symbol, {
          symbol: q.symbol,
          companyName: q.shortName || null,
          price: q.regularMarketPrice ?? null,
          change: q.regularMarketChange ?? null,
          changePercent: q.regularMarketChangePercent ?? null,
          marketState: q.marketState || null,
        });
      }
    }

    const result: WatchlistQuote[] = watchlist.map(w => {
      const quote = quoteMap.get(w.symbol);
      return {
        symbol: w.symbol,
        companyName: quote?.companyName || w.company_name,
        price: quote?.price ?? null,
        change: quote?.change ?? null,
        changePercent: quote?.changePercent ?? null,
        marketState: quote?.marketState ?? null,
      };
    });

    return NextResponse.json({ quotes: result });
  } catch (err) {
    console.error('Failed to fetch quotes:', err);
    const fallback: WatchlistQuote[] = watchlist.map(w => ({
      symbol: w.symbol,
      companyName: w.company_name,
      price: null,
      change: null,
      changePercent: null,
      marketState: null,
    }));
    return NextResponse.json({ quotes: fallback });
  }
}
