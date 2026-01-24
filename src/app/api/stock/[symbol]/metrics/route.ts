import { NextResponse } from 'next/server';
import { getCompanyScores } from '@/lib/api/financials';

interface RouteParams {
  params: Promise<{ symbol: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { symbol } = await params;

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }

  const scores = await getCompanyScores(symbol.toUpperCase());

  if (!scores) {
    return NextResponse.json({ error: 'Metrics not available' }, { status: 404 });
  }

  return NextResponse.json(scores);
}
