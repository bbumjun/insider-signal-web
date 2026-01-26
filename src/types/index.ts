export interface StockPrice {
  date: string;
  close: number;
}

export interface InsiderTransaction {
  transactionDate: string;
  transactionCode: string;
  name: string;
  share: number;
  transactionPrice: number;
}

export interface CompanyNews {
  datetime?: number;
  publishedAt?: string;
  headline: string;
  url: string;
  summary?: string;
}

export interface StockData {
  prices: StockPrice[];
  insiderTransactions: InsiderTransaction[];
  news: CompanyNews[];
}

export interface QuarterlyFinancial {
  date: string;
  quarterLabel: string;
  revenue: number | null;
  netIncome: number | null;
  operatingIncome: number | null;
  grossProfit: number | null;
  grossMargin: number | null;
  operatingMargin: number | null;
  netMargin: number | null;
  revenueGrowthYoY: number | null;
  netIncomeGrowthYoY: number | null;
}

export interface FinancialTrendData {
  symbol: string;
  currency: string;
  quarters: QuarterlyFinancial[];
  latestMetrics: {
    revenueGrowth: number | null;
    marginTrend: 'improving' | 'stable' | 'declining' | null;
    profitabilityTrend: 'improving' | 'stable' | 'declining' | null;
  };
}

export interface EarningsEvent {
  symbol: string;
  date: string;
  hour: 'bmo' | 'amc' | 'dmh' | ''; // before market open, after market close, during market hours
  epsEstimate: number | null;
  epsActual: number | null;
  revenueEstimate: number | null;
  revenueActual: number | null;
  quarter: number | null;
  year: number | null;
  marketCap: number | null; // 시가총액 (USD)
}
