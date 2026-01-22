import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

async function fetchCurrentPrice(symbol: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    return price ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('insider_screener')
      .select('*')
      .order('value', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    const grouped = new Map<string, any>();
    
    data?.forEach(trade => {
      const existing = grouped.get(trade.symbol);
      
      if (!existing) {
        grouped.set(trade.symbol, {
          symbol: trade.symbol,
          companyName: trade.company_name,
          totalValue: 0,
          tradeCount: 0,
          latestDate: trade.transaction_date,
          latestPrice: Number(trade.price),
          insiders: new Set(),
        });
      }
      
      const group = grouped.get(trade.symbol)!;
      group.totalValue += Number(trade.value);
      group.tradeCount += 1;
      group.insiders.add(trade.insider_name);
      
      if (trade.transaction_date > group.latestDate) {
        group.latestDate = trade.transaction_date;
        group.latestPrice = Number(trade.price);
      }
    });

    const top10 = Array.from(grouped.values())
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);

    const symbols = top10.map(g => g.symbol);
    const prices = await Promise.all(symbols.map(s => fetchCurrentPrice(s)));
    
    const result = top10.map((g, i) => {
      const currentPrice = prices[i];
      const buyPrice = g.latestPrice;
      let returnPct: number | null = null;
      
      if (currentPrice && buyPrice && buyPrice > 0) {
        returnPct = ((currentPrice - buyPrice) / buyPrice) * 100;
      }
      
      return {
        symbol: g.symbol,
        companyName: g.companyName,
        totalValue: g.totalValue,
        tradeCount: g.tradeCount,
        latestDate: g.latestDate,
        insiderCount: g.insiders.size,
        buyPrice,
        currentPrice,
        returnPct,
      };
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    const err = error as Error;
    console.error('[Insider Screener List Error]', err);
    return NextResponse.json({ 
      error: 'Failed to fetch insider trades',
      details: err.message,
    }, { status: 500 });
  }
}
