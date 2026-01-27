import { NextResponse } from 'next/server';
import { withCache } from '@/lib/cache/supabaseCache';
import { QuarterlyFinancial } from '@/types';
import { getFinancialData, QuarterlyFinancialSEC } from '@/lib/api/sec-edgar';

interface RouteParams {
  params: Promise<{ symbol: string }>;
}

interface FinancialTrendResponse {
  symbol: string;
  currency: string;
  quarterly: QuarterlyFinancial[];
  annual: QuarterlyFinancial[];
  hasQuarterly: boolean;
  hasAnnual: boolean;
  latestMetrics: {
    revenueGrowth: number | null;
    marginTrend: 'improving' | 'stable' | 'declining' | null;
    profitabilityTrend: 'improving' | 'stable' | 'declining' | null;
  };
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

function findSamePeriodPrevYear(
  data: QuarterlyFinancialSEC[],
  currentIndex: number
): QuarterlyFinancialSEC | null {
  const current = data[currentIndex];
  const targetYear = current.fiscalYear - 1;
  const targetPeriod = current.fiscalPeriod;

  return data.find(q => q.fiscalYear === targetYear && q.fiscalPeriod === targetPeriod) ?? null;
}

function transformToQuarterlyFinancial(
  secData: QuarterlyFinancialSEC[],
  index: number
): QuarterlyFinancial {
  const current = secData[index];
  const prevYear = findSamePeriodPrevYear(secData, index);

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

async function fetchFinancials(symbol: string): Promise<FinancialTrendResponse | null> {
  const data = await getFinancialData(symbol, 16, 10);
  if (!data) return null;

  const { quarterly: quarterlyRaw, annual: annualRaw, hasQuarterly, hasAnnual } = data;

  if (!hasQuarterly && !hasAnnual) return null;

  const quarterly: QuarterlyFinancial[] = quarterlyRaw.map((_, index) =>
    transformToQuarterlyFinancial(quarterlyRaw, index)
  );

  const annual: QuarterlyFinancial[] = annualRaw.map((_, index) =>
    transformToQuarterlyFinancial(annualRaw, index)
  );

  const primaryData = hasQuarterly ? quarterly : annual;
  const recentData = primaryData.slice(-8);
  const operatingMargins = recentData.map(q => q.operatingMargin);
  const netMargins = recentData.map(q => q.netMargin);
  const latestGrowth = recentData[recentData.length - 1]?.revenueGrowthYoY ?? null;

  return {
    symbol: symbol.toUpperCase(),
    currency: 'USD',
    quarterly: quarterly.slice(-12),
    annual: annual.slice(-8),
    hasQuarterly,
    hasAnnual,
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

  const cacheKey = `financials-v2:${symbol.toUpperCase()}`;
  const data = await withCache(cacheKey, () => fetchFinancials(symbol.toUpperCase()), {
    ttlMinutes: 360,
  });

  if (!data) {
    return NextResponse.json({ error: 'Financial data not available' }, { status: 404 });
  }

  return NextResponse.json(data);
}
