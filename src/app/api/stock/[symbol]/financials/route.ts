import { NextResponse } from 'next/server';
import { withCache } from '@/lib/cache/supabaseCache';
import { QuarterlyFinancial, FinancialTrendData } from '@/types';
import { getQuarterlyFinancials, QuarterlyFinancialSEC } from '@/lib/api/sec-edgar';

interface RouteParams {
  params: Promise<{ symbol: string }>;
}

function calculateMargin(
  numerator: number | null | undefined,
  denominator: number | null | undefined
): number | null {
  if (!numerator || !denominator || denominator === 0) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function calculateYoYGrowth(
  current: number | null | undefined,
  previous: number | null | undefined
): number | null {
  if (!current || !previous || previous === 0) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
}

function determineTrend(values: (number | null)[]): 'improving' | 'stable' | 'declining' | null {
  const validValues = values.filter((v): v is number => v !== null);
  if (validValues.length < 3) return null;

  const recentThree = validValues.slice(-3);
  const firstHalf = recentThree[0];
  const lastHalf = recentThree[recentThree.length - 1];

  const changePercent = ((lastHalf - firstHalf) / Math.abs(firstHalf)) * 100;

  if (changePercent > 5) return 'improving';
  if (changePercent < -5) return 'declining';
  return 'stable';
}

function findSameQuarterPrevYear(
  quarters: QuarterlyFinancialSEC[],
  currentIndex: number
): QuarterlyFinancialSEC | null {
  const current = quarters[currentIndex];
  const targetYear = current.fiscalYear - 1;
  const targetPeriod = current.fiscalPeriod;

  return quarters.find(q => q.fiscalYear === targetYear && q.fiscalPeriod === targetPeriod) ?? null;
}

function transformSECToQuarterlyFinancial(
  secData: QuarterlyFinancialSEC[],
  index: number
): QuarterlyFinancial {
  const current = secData[index];
  const prevYear = findSameQuarterPrevYear(secData, index);

  return {
    date: current.date,
    quarterLabel: current.quarterLabel,
    revenue: current.revenue,
    netIncome: current.netIncome,
    operatingIncome: current.operatingIncome,
    grossProfit: current.grossProfit,
    grossMargin: calculateMargin(current.grossProfit, current.revenue),
    operatingMargin: calculateMargin(current.operatingIncome, current.revenue),
    netMargin: calculateMargin(current.netIncome, current.revenue),
    revenueGrowthYoY: calculateYoYGrowth(current.revenue, prevYear?.revenue),
    netIncomeGrowthYoY: calculateYoYGrowth(current.netIncome, prevYear?.netIncome),
  };
}

async function fetchFinancialsFromSEC(symbol: string): Promise<FinancialTrendData | null> {
  const secData = await getQuarterlyFinancials(symbol, 16);
  if (!secData || secData.length === 0) return null;

  const hasValidData = secData.some(q => q.revenue !== null || q.netIncome !== null);
  if (!hasValidData) return null;

  const quarters: QuarterlyFinancial[] = secData.map((_, index) =>
    transformSECToQuarterlyFinancial(secData, index)
  );

  const recentQuarters = quarters.slice(-8);
  const operatingMargins = recentQuarters.map(q => q.operatingMargin);
  const netMargins = recentQuarters.map(q => q.netMargin);
  const latestGrowth = recentQuarters[recentQuarters.length - 1]?.revenueGrowthYoY ?? null;

  return {
    symbol: symbol.toUpperCase(),
    currency: 'USD',
    quarters: recentQuarters,
    latestMetrics: {
      revenueGrowth: latestGrowth,
      marginTrend: determineTrend(operatingMargins),
      profitabilityTrend: determineTrend(netMargins),
    },
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  const { symbol } = await params;

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }

  const cacheKey = `financials:${symbol.toUpperCase()}`;
  const data = await withCache(cacheKey, () => fetchFinancialsFromSEC(symbol.toUpperCase()), {
    ttlMinutes: 360,
  });

  if (!data) {
    return NextResponse.json({ error: 'Financial data not available' }, { status: 404 });
  }

  return NextResponse.json(data);
}
