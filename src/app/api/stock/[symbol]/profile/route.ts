import { NextResponse } from 'next/server';
import { fetchCompanyProfile } from '@/lib/api/companyProfile';

export async function GET(request: Request, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;

  try {
    const profile = await fetchCompanyProfile(symbol);
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Failed to fetch company profile:', error);
    return NextResponse.json({ error: 'Failed to fetch company profile' }, { status: 500 });
  }
}
