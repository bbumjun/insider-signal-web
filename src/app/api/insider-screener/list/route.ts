import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('insider_screener')
      .select('*')
      .order('value', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    const grouped = new Map<string, any>();
    
    data?.forEach(trade => {
      if (!grouped.has(trade.symbol)) {
        grouped.set(trade.symbol, {
          symbol: trade.symbol,
          companyName: trade.company_name,
          totalValue: 0,
          tradeCount: 0,
          latestDate: trade.transaction_date,
          insiders: new Set(),
        });
      }
      
      const group = grouped.get(trade.symbol)!;
      group.totalValue += Number(trade.value);
      group.tradeCount += 1;
      group.insiders.add(trade.insider_name);
      
      if (trade.transaction_date > group.latestDate) {
        group.latestDate = trade.transaction_date;
      }
    });

    const result = Array.from(grouped.values())
      .map(g => ({
        ...g,
        insiderCount: g.insiders.size,
        insiders: undefined,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);

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
