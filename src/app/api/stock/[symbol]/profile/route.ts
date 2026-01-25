import { NextResponse } from 'next/server';
import { fetchCompanyProfile } from '@/lib/api/companyProfile';

export async function GET(request: Request, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;

  try {
    const { data: profile, cachedAt } = await fetchCompanyProfile(symbol);
    return NextResponse.json({ ...profile, cachedAt });
  } catch (error) {
    console.error('Failed to fetch company profile:', error);
    return NextResponse.json({ error: 'Failed to fetch company profile' }, { status: 500 });
  }
}
