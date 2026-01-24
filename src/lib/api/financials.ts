import { withCache } from '@/lib/cache/supabaseCache';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const API_KEY = process.env.FINNHUB_API_KEY;

export interface CompanyMetrics {
  roeTTM: number | null;
  revenueGrowthTTMYoy: number | null;
  operatingMarginTTM: number | null;
  currentRatioQuarterly: number | null;
  focfCagr5Y: number | null;
  pegTTM: number | null;
}

export interface CompanyScore {
  profitability: number;
  growth: number;
  margin: number;
  stability: number;
  cashFlow: number;
  valuation: number;
  overall: number;
}

interface FinnhubMetricResponse {
  metric: Record<string, number | null>;
  metricType: string;
  symbol: string;
}

async function fetchMetricsRaw(symbol: string): Promise<CompanyMetrics | null> {
  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/stock/metric?symbol=${symbol}&metric=all&token=${API_KEY}`
    );

    if (!response.ok) return null;

    const data: FinnhubMetricResponse = await response.json();
    const m = data.metric;

    if (!m) return null;

    return {
      roeTTM: m.roeTTM ?? null,
      revenueGrowthTTMYoy: m.revenueGrowthTTMYoy ?? null,
      operatingMarginTTM: m.operatingMarginTTM ?? null,
      currentRatioQuarterly: m.currentRatioQuarterly ?? null,
      focfCagr5Y: m.focfCagr5Y ?? null,
      pegTTM: m.pegTTM ?? null,
    };
  } catch {
    return null;
  }
}

export async function fetchCompanyMetrics(symbol: string): Promise<CompanyMetrics | null> {
  const cacheKey = `metrics:${symbol.toUpperCase()}`;
  return withCache(cacheKey, () => fetchMetricsRaw(symbol), { ttlMinutes: 60 * 24 * 30 });
}

function normalizeScore(value: number | null, min: number, max: number, inverse = false): number {
  if (value === null || isNaN(value)) return 50;

  const clamped = Math.max(min, Math.min(max, value));
  let normalized = ((clamped - min) / (max - min)) * 100;

  if (inverse) normalized = 100 - normalized;

  return Math.round(normalized);
}

export function calculateScores(metrics: CompanyMetrics): CompanyScore {
  const profitability = normalizeScore(metrics.roeTTM, -10, 40);
  const growth = normalizeScore(metrics.revenueGrowthTTMYoy, -20, 50);
  const margin = normalizeScore(metrics.operatingMarginTTM, -10, 40);
  const stability = normalizeScore(metrics.currentRatioQuarterly, 0.5, 3);
  const cashFlow = normalizeScore(metrics.focfCagr5Y, -20, 30);
  const valuation = normalizeScore(metrics.pegTTM, 0, 3, true);

  const overall = Math.round(
    (profitability + growth + margin + stability + cashFlow + valuation) / 6
  );

  return {
    profitability,
    growth,
    margin,
    stability,
    cashFlow,
    valuation,
    overall,
  };
}

export async function getCompanyScores(symbol: string): Promise<CompanyScore | null> {
  const metrics = await fetchCompanyMetrics(symbol);
  if (!metrics) return null;
  return calculateScores(metrics);
}
