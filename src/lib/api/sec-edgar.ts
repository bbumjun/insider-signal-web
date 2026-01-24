/**
 * SEC EDGAR API 클라이언트
 * - 무료, 인증 불필요
 * - 10 req/sec 제한
 * - 2009년부터 historical 데이터 제공
 */

import { withCache } from '@/lib/cache/supabaseCache';

const SEC_USER_AGENT = 'insider-signal contact@insider-signal.com';
const SEC_BASE_URL = 'https://data.sec.gov';
const COMPANY_TICKERS_URL = 'https://www.sec.gov/files/company_tickers.json';

let tickerToCikCache: Map<string, string> | null = null;

interface CompanyTicker {
  cik_str: number;
  ticker: string;
  title: string;
}

interface SECFact {
  val: number;
  accn: string;
  fy: number;
  fp: string; // Q1, Q2, Q3, Q4, FY
  form: string; // 10-Q, 10-K
  filed: string;
  frame?: string; // CY2023Q1, CY2024Q2I 등
  start?: string;
  end: string;
}

interface SECFactUnit {
  USD?: SECFact[];
  shares?: SECFact[];
}

interface SECCompanyFacts {
  cik: number;
  entityName: string;
  facts: {
    'us-gaap'?: Record<string, { units: SECFactUnit; label: string; description: string }>;
    dei?: Record<string, { units: SECFactUnit }>;
  };
}

export interface QuarterlyFinancialSEC {
  date: string;
  quarterLabel: string;
  fiscalYear: number;
  fiscalPeriod: string;
  revenue: number | null;
  netIncome: number | null;
  operatingIncome: number | null;
  grossProfit: number | null;
}

async function loadTickerToCikMap(): Promise<Map<string, string>> {
  if (tickerToCikCache) return tickerToCikCache;

  const response = await fetch(COMPANY_TICKERS_URL, {
    headers: { 'User-Agent': SEC_USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch company tickers: ${response.status}`);
  }

  const data = (await response.json()) as Record<string, CompanyTicker>;
  const map = new Map<string, string>();

  for (const entry of Object.values(data)) {
    const cik = entry.cik_str.toString().padStart(10, '0');
    map.set(entry.ticker.toUpperCase(), cik);
  }

  tickerToCikCache = map;
  return map;
}

export async function tickerToCik(ticker: string): Promise<string | null> {
  const map = await loadTickerToCikMap();
  return map.get(ticker.toUpperCase()) || null;
}

async function fetchCompanyFacts(cik: string): Promise<SECCompanyFacts | null> {
  const url = `${SEC_BASE_URL}/api/xbrl/companyfacts/CIK${cik}.json`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': SEC_USER_AGENT },
    });

    if (!response.ok) {
      console.error(`SEC EDGAR error: ${response.status} for CIK ${cik}`);
      return null;
    }

    return (await response.json()) as SECCompanyFacts;
  } catch (error) {
    console.error('Failed to fetch SEC company facts:', error);
    return null;
  }
}

function isQuarterlyPeriod(fact: SECFact): boolean {
  if (!fact.start || !fact.end) return false;
  const startDate = new Date(fact.start);
  const endDate = new Date(fact.end);
  const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff >= 80 && daysDiff <= 100;
}

function extractQuarterlyValues(
  facts: SECCompanyFacts['facts'],
  conceptNames: string[]
): Map<string, number> {
  const usGaap = facts['us-gaap'];
  if (!usGaap) return new Map();

  let bestMap = new Map<string, number>();
  let bestMaxYear = 0;

  for (const conceptName of conceptNames) {
    const concept = usGaap[conceptName];
    if (!concept?.units?.USD) continue;

    const currentMap = new Map<string, number>();
    let currentMaxYear = 0;

    const quarterlyFacts = concept.units.USD.filter(fact => {
      if (fact.form === '10-K' && fact.fp === 'FY') {
        return isQuarterlyPeriod(fact);
      }
      if (fact.form === '10-Q') {
        return isQuarterlyPeriod(fact);
      }
      return false;
    });

    for (const fact of quarterlyFacts) {
      const quarterKey = fact.fp === 'FY' ? `${fact.fy}-Q4` : `${fact.fy}-${fact.fp}`;

      if (!currentMap.has(quarterKey)) {
        currentMap.set(quarterKey, fact.val);
        if (fact.fy > currentMaxYear) currentMaxYear = fact.fy;
      }
    }

    if (currentMap.size > 0 && currentMaxYear > bestMaxYear) {
      bestMap = currentMap;
      bestMaxYear = currentMaxYear;
    }
  }

  return bestMap;
}

function quarterKeyToDate(quarterKey: string): string {
  const [year, quarter] = quarterKey.split('-');
  const quarterNum = parseInt(quarter.replace('Q', ''));
  const month = quarterNum * 3;
  const lastDay = new Date(parseInt(year), month, 0).getDate();
  return `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
}

function getQuarterLabel(quarterKey: string): string {
  const [year, quarter] = quarterKey.split('-');
  return `${quarter} ${year}`;
}

export async function getQuarterlyFinancials(
  symbol: string,
  quarters: number = 12
): Promise<QuarterlyFinancialSEC[] | null> {
  const cik = await tickerToCik(symbol);
  if (!cik) {
    console.log(`CIK not found for symbol: ${symbol}`);
    return null;
  }

  const cacheKey = `sec-facts:${cik}`;
  const companyFacts = await withCache(cacheKey, () => fetchCompanyFacts(cik), {
    ttlMinutes: 1440,
  });

  if (!companyFacts) return null;

  const revenueMap = extractQuarterlyValues(companyFacts.facts, [
    'Revenues',
    'RevenueFromContractWithCustomerExcludingAssessedTax',
    'SalesRevenueNet',
    'TotalRevenuesAndOtherIncome',
    'RevenueFromContractWithCustomerIncludingAssessedTax',
  ]);

  const netIncomeMap = extractQuarterlyValues(companyFacts.facts, [
    'NetIncomeLoss',
    'NetIncomeLossAvailableToCommonStockholdersBasic',
    'ProfitLoss',
  ]);

  const operatingIncomeMap = extractQuarterlyValues(companyFacts.facts, [
    'OperatingIncomeLoss',
    'IncomeLossFromOperations',
  ]);

  const grossProfitMap = extractQuarterlyValues(companyFacts.facts, ['GrossProfit']);

  const allQuarterKeys = new Set<string>();
  [revenueMap, netIncomeMap, operatingIncomeMap, grossProfitMap].forEach(map => {
    map.forEach((_, key) => allQuarterKeys.add(key));
  });

  const sortedQuarters = Array.from(allQuarterKeys).sort((a, b) => {
    const [yearA, qA] = a.split('-');
    const [yearB, qB] = b.split('-');
    const numA = parseInt(yearA) * 10 + parseInt(qA.replace('Q', ''));
    const numB = parseInt(yearB) * 10 + parseInt(qB.replace('Q', ''));
    return numA - numB;
  });

  const recentQuarters = sortedQuarters.slice(-quarters);

  const results: QuarterlyFinancialSEC[] = recentQuarters.map(quarterKey => {
    const [year, quarter] = quarterKey.split('-');
    return {
      date: quarterKeyToDate(quarterKey),
      quarterLabel: getQuarterLabel(quarterKey),
      fiscalYear: parseInt(year),
      fiscalPeriod: quarter,
      revenue: revenueMap.get(quarterKey) ?? null,
      netIncome: netIncomeMap.get(quarterKey) ?? null,
      operatingIncome: operatingIncomeMap.get(quarterKey) ?? null,
      grossProfit: grossProfitMap.get(quarterKey) ?? null,
    };
  });

  return results;
}

export async function getCompanyName(symbol: string): Promise<string | null> {
  const cik = await tickerToCik(symbol);
  if (!cik) return null;

  const cacheKey = `sec-facts:${cik}`;
  const companyFacts = await withCache(cacheKey, () => fetchCompanyFacts(cik), {
    ttlMinutes: 1440,
  });

  return companyFacts?.entityName ?? null;
}
