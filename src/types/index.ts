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
