import { generateAnalysisStream } from '@/lib/api/gemini';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { StockData } from '@/types';

export async function POST(request: Request, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const body: StockData = await request.json();
  const { prices, insiderTransactions, news } = body;

  const supabase = createServerSupabaseClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: cached } = await supabase
    .from('ai_insights')
    .select('content, generated_at')
    .eq('symbol', symbol.toUpperCase())
    .gt('generated_at', todayStart.toISOString())
    .order('generated_at', { ascending: false })
    .limit(1)
    .single();

  if (cached) {
    console.log(`[Cache Hit] Serving analysis for ${symbol} from Supabase`);
    return new Response(cached.content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Cache': 'HIT',
        'X-Cached-At': cached.generated_at,
      },
    });
  }

  console.log(`[Cache Miss] Streaming analysis for ${symbol} via Gemini`);

  const encoder = new TextEncoder();
  let fullContent = '';

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const generator = generateAnalysisStream(symbol, { prices, insiderTransactions, news });

        for await (const chunk of generator) {
          fullContent += chunk;
          controller.enqueue(encoder.encode(chunk));
        }

        controller.close();

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        supabase
          .from('ai_insights')
          .insert({
            symbol: symbol.toUpperCase(),
            content: fullContent,
            expires_at: tomorrow.toISOString(),
          })
          .then(({ error }) => {
            if (error) {
              console.error('[Supabase Insert Error]', error);
            } else {
              console.log(`[Cache Saved] ${symbol}`);
            }
          });
      } catch (error) {
        const err = error as Error;
        console.error('[Analysis Error]', {
          symbol,
          message: err.message,
          stack: err.stack,
          name: err.name,
        });
        controller.enqueue(encoder.encode(`[ERROR] ${err.message}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Cache': 'MISS',
      'Transfer-Encoding': 'chunked',
    },
  });
}
