import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function DELETE(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.ADMIN_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: 'ADMIN_SECRET not configured' },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const supabase = createServerSupabaseClient();
  const url = new URL(request.url);
  const symbol = url.searchParams.get('symbol');
  const table = url.searchParams.get('table') || 'ai_insights';

  try {
    if (table === 'ai_insights') {
      if (symbol) {
        const { error } = await supabase
          .from('ai_insights')
          .delete()
          .eq('symbol', symbol.toUpperCase());

        if (error) throw error;

        return NextResponse.json({
          success: true,
          message: `Invalidated ai_insights cache for ${symbol.toUpperCase()}`,
        });
      } else {
        const { error } = await supabase
          .from('ai_insights')
          .delete()
          .neq('symbol', '');

        if (error) throw error;

        return NextResponse.json({
          success: true,
          message: 'Invalidated all ai_insights cache',
        });
      }
    } else if (table === 'api_cache') {
      const { error } = await supabase
        .from('api_cache')
        .delete()
        .neq('cache_key', '');

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Invalidated all api_cache',
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid table parameter. Use "ai_insights" or "api_cache"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to invalidate cache', details: String(error) },
      { status: 500 }
    );
  }
}
