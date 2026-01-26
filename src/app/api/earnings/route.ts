import { NextRequest, NextResponse } from 'next/server';
import { fetchEarningsCalendar } from '@/lib/api/finnhub';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!from || !to) {
    return NextResponse.json(
      { error: 'from과 to 파라미터가 필요합니다' },
      { status: 400 }
    );
  }

  try {
    const earnings = await fetchEarningsCalendar(from, to);
    return NextResponse.json({ earnings });
  } catch (error) {
    console.error('실적 캘린더 조회 실패:', error);
    return NextResponse.json(
      { error: '실적 캘린더를 가져오는데 실패했습니다' },
      { status: 500 }
    );
  }
}
