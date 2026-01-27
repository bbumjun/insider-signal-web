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
  fp: string;
  form: string;
  filed: string;
  frame?: string;
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

export interface FinancialDataResult {
  quarterly: QuarterlyFinancialSEC[];
  annual: QuarterlyFinancialSEC[];
  hasQuarterly: boolean;
  hasAnnual: boolean;
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

function getPeriodDays(fact: SECFact): number {
  if (!fact.start || !fact.end) return 0;
  const startDate = new Date(fact.start);
  const endDate = new Date(fact.end);
  return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
}

function isQuarterlyPeriod(fact: SECFact): boolean {
  const days = getPeriodDays(fact);
  return days >= 80 && days <= 100;
}

function isAnnualPeriod(fact: SECFact): boolean {
  const days = getPeriodDays(fact);
  return days >= 350 && days <= 380;
}

type PeriodType = 'quarterly' | 'annual';

function extractValues(
  facts: SECCompanyFacts['facts'],
  conceptNames: string[],
  periodType: PeriodType
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

    const filteredFacts = concept.units.USD.filter(fact => {
      const isUSForm = fact.form === '10-K' || fact.form === '10-Q';
      const isForeignForm = fact.form === '20-F' || fact.form === '20-F/A' || fact.form === '6-K';

      if (!isUSForm && !isForeignForm) return false;

      if (periodType === 'quarterly') {
        return isQuarterlyPeriod(fact);
      } else {
        return isAnnualPeriod(fact);
      }
    });

    for (const fact of filteredFacts) {
      let periodKey: string;
      if (periodType === 'annual') {
        periodKey = `${fact.fy}-FY`;
      } else if (fact.fp === 'FY') {
        periodKey = `${fact.fy}-Q4`;
      } else {
        periodKey = `${fact.fy}-${fact.fp}`;
      }

      if (!currentMap.has(periodKey)) {
        currentMap.set(periodKey, fact.val);
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

function periodKeyToDate(periodKey: string): string {
  const [year, period] = periodKey.split('-');
  if (period === 'FY') {
    return `${year}-12-31`;
  }
  const quarterNum = parseInt(period.replace('Q', ''));
  const month = quarterNum * 3;
  const lastDay = new Date(parseInt(year), month, 0).getDate();
  return `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
}

function getPeriodLabel(periodKey: string): string {
  const [year, period] = periodKey.split('-');
  return `${period} ${year}`;
}

function buildFinancialData(
  revenueMap: Map<string, number>,
  netIncomeMap: Map<string, number>,
  operatingIncomeMap: Map<string, number>,
  grossProfitMap: Map<string, number>,
  limit: number
): QuarterlyFinancialSEC[] {
  const allKeys = new Set<string>();
  [revenueMap, netIncomeMap, operatingIncomeMap, grossProfitMap].forEach(map => {
    map.forEach((_, key) => allKeys.add(key));
  });

  const sortedKeys = Array.from(allKeys).sort((a, b) => {
    const [yearA, pA] = a.split('-');
    const [yearB, pB] = b.split('-');
    const numA = parseInt(yearA) * 10 + (pA === 'FY' ? 5 : parseInt(pA.replace('Q', '')));
    const numB = parseInt(yearB) * 10 + (pB === 'FY' ? 5 : parseInt(pB.replace('Q', '')));
    return numA - numB;
  });

  const recentKeys = sortedKeys.slice(-limit);

  return recentKeys.map(key => {
    const [year, period] = key.split('-');
    return {
      date: periodKeyToDate(key),
      quarterLabel: getPeriodLabel(key),
      fiscalYear: parseInt(year),
      fiscalPeriod: period,
      revenue: revenueMap.get(key) ?? null,
      netIncome: netIncomeMap.get(key) ?? null,
      operatingIncome: operatingIncomeMap.get(key) ?? null,
      grossProfit: grossProfitMap.get(key) ?? null,
    };
  });
}

const REVENUE_CONCEPTS = [
  'Revenues',
  'RevenueFromContractWithCustomerExcludingAssessedTax',
  'SalesRevenueNet',
  'TotalRevenuesAndOtherIncome',
  'RevenueFromContractWithCustomerIncludingAssessedTax',
];

const NET_INCOME_CONCEPTS = [
  'NetIncomeLoss',
  'NetIncomeLossAvailableToCommonStockholdersBasic',
  'ProfitLoss',
];

const OPERATING_INCOME_CONCEPTS = ['OperatingIncomeLoss', 'IncomeLossFromOperations'];

const GROSS_PROFIT_CONCEPTS = ['GrossProfit'];

export async function getFinancialData(
  symbol: string,
  quarterlyLimit: number = 12,
  annualLimit: number = 8
): Promise<FinancialDataResult | null> {
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

  const quarterlyRevenue = extractValues(companyFacts.facts, REVENUE_CONCEPTS, 'quarterly');
  const quarterlyNetIncome = extractValues(companyFacts.facts, NET_INCOME_CONCEPTS, 'quarterly');
  const quarterlyOperating = extractValues(
    companyFacts.facts,
    OPERATING_INCOME_CONCEPTS,
    'quarterly'
  );
  const quarterlyGrossProfit = extractValues(
    companyFacts.facts,
    GROSS_PROFIT_CONCEPTS,
    'quarterly'
  );

  const annualRevenue = extractValues(companyFacts.facts, REVENUE_CONCEPTS, 'annual');
  const annualNetIncome = extractValues(companyFacts.facts, NET_INCOME_CONCEPTS, 'annual');
  const annualOperating = extractValues(companyFacts.facts, OPERATING_INCOME_CONCEPTS, 'annual');
  const annualGrossProfit = extractValues(companyFacts.facts, GROSS_PROFIT_CONCEPTS, 'annual');

  const quarterly = buildFinancialData(
    quarterlyRevenue,
    quarterlyNetIncome,
    quarterlyOperating,
    quarterlyGrossProfit,
    quarterlyLimit
  );

  const annual = buildFinancialData(
    annualRevenue,
    annualNetIncome,
    annualOperating,
    annualGrossProfit,
    annualLimit
  );

  const hasQuarterly =
    quarterly.length > 0 && quarterly.some(q => q.revenue !== null || q.netIncome !== null);
  const hasAnnual =
    annual.length > 0 && annual.some(a => a.revenue !== null || a.netIncome !== null);

  return { quarterly, annual, hasQuarterly, hasAnnual };
}

export async function getQuarterlyFinancials(
  symbol: string,
  quarters: number = 12
): Promise<QuarterlyFinancialSEC[] | null> {
  const result = await getFinancialData(symbol, quarters, 8);
  if (!result) return null;
  return result.hasQuarterly ? result.quarterly : result.annual;
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
