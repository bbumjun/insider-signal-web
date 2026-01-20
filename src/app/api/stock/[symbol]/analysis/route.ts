import { NextResponse } from 'next/server';
import { generateAnalysis } from '@/lib/api/gemini';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { StockData } from '@/types';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const body: StockData = await request.json();
  const { prices, insiderTransactions, news } = body;

  const supabase = createServerSupabaseClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: cached } = await supabase
    .from('ai_insights')
    .select('content')
    .eq('symbol', symbol.toUpperCase())
    .gt('generated_at', todayStart.toISOString())
    .order('generated_at', { ascending: false })
    .limit(1)
    .single();

  if (cached) {
    console.log(`[Cache Hit] Serving analysis for ${symbol} from Supabase`);
    return NextResponse.json({ insight: cached.content });
  }

  console.log(`[Cache Miss] Generating new analysis for ${symbol} via Gemini`);
  try {
    const insight = await generateAnalysis(symbol, { prices, insiderTransactions, news });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const { error: insertError } = await supabase.from('ai_insights').insert({
      symbol: symbol.toUpperCase(),
      content: insight,
      expires_at: tomorrow.toISOString(),
    });

    if (insertError) {
      console.error('[Supabase Insert Error]', insertError);
    }

    return NextResponse.json({ insight });
  } catch (error) {
    const err = error as Error;
    console.error('[Analysis Error]', {
      symbol,
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    return NextResponse.json({ 
      error: 'Failed to generate analysis',
      details: err.message 
    }, { status: 500 });
  }
}
