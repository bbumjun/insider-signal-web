import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface InsiderTrade {
  symbol: string;
  companyName: string;
  insiderName: string;
  transactionDate: string;
  shares: number;
  price: number;
  value: number;
}

async function scrapeOpenInsider(): Promise<InsiderTrade[]> {
  const url = 'http://openinsider.com/screener?s=&o=&pl=&ph=&ll=&lh=&fd=30&fdr=&td=0&tdr=&fdlyl=&fdlyh=&daysago=&xp=1&xs=1&vl=&vh=&ocl=&och=&sic1=-1&sicl=100&sich=9999&grp=0&nfl=&nfh=&nil=&nih=&nol=&noh=&v2l=&v2h=&oc2l=&oc2h=&sortcol=0&cnt=100&page=1';
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    const tableRegex = /<table[^>]*class="tinytable"[^>]*>([\s\S]*?)<\/table>/i;
    const tableMatch = html.match(tableRegex);
    
    if (!tableMatch) {
      throw new Error('Table not found');
    }

    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const rows = tableMatch[1].match(rowRegex) || [];
    
    const trades: InsiderTrade[] = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      const cells: string[] = [];
      let match;
      
      while ((match = cellRegex.exec(row)) !== null) {
        const cellContent = match[1]
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .trim();
        cells.push(cellContent);
      }
      
      if (cells.length < 10) continue;
      
      const symbol = cells[3];
      const companyName = cells[4];
      const insiderName = cells[5];
      const transactionDate = cells[1];
      const shares = parseFloat(cells[8].replace(/,/g, '')) || 0;
      const price = parseFloat(cells[9].replace(/[$,]/g, '')) || 0;
      const value = parseFloat(cells[10].replace(/[$,]/g, '')) || 0;
      
      if (symbol && shares > 0 && value > 0) {
        trades.push({
          symbol,
          companyName,
          insiderName,
          transactionDate,
          shares,
          price,
          value,
        });
      }
    }
    
    return trades;
  } catch (error) {
    console.error('[OpenInsider Scrape Error]', error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    const secretParam = searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret) {
      const isValidAuth = authHeader === `Bearer ${cronSecret}` || secretParam === cronSecret;
      if (!isValidAuth) {
        console.error('[Auth Failed]', { 
          hasAuthHeader: !!authHeader, 
          hasSecretParam: !!secretParam 
        });
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('[Insider Screener] Starting scrape...');
    const trades = await scrapeOpenInsider();
    console.log(`[Insider Screener] Found ${trades.length} trades`);

    const supabase = createServerSupabaseClient();
    
    const { error: deleteError } = await supabase
      .from('insider_screener')
      .delete()
      .neq('symbol', '');
    
    if (deleteError) {
      console.error('[Supabase Delete Error]', deleteError);
    }

    if (trades.length > 0) {
      const { error: insertError } = await supabase
        .from('insider_screener')
        .insert(
          trades.map(t => ({
            symbol: t.symbol,
            company_name: t.companyName,
            insider_name: t.insiderName,
            transaction_date: t.transactionDate,
            shares: t.shares,
            price: t.price,
            value: t.value,
          }))
        );

      if (insertError) {
        console.error('[Supabase Insert Error]', insertError);
        throw insertError;
      }
    }

    return NextResponse.json({ 
      success: true, 
      count: trades.length,
      sample: trades.slice(0, 5),
    });
  } catch (error) {
    const err = error as Error;
    console.error('[Insider Screener Error]', err);
    return NextResponse.json({ 
      error: 'Failed to scrape insider trades',
      details: err.message,
    }, { status: 500 });
  }
}
