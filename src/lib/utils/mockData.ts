import { StockData, StockPrice, InsiderTransaction, CompanyNews } from '@/types';

export function getMockStockData(symbol: string): StockData {
  const prices: StockPrice[] = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    close: 150 + Math.random() * 50,
  }));

  const insiderTransactions: InsiderTransaction[] = [
    {
      transactionDate: prices[5].date,
      name: 'John Doe',
      transactionCode: 'P',
      share: 10000,
      transactionPrice: prices[5].close - 2,
    },
    {
      transactionDate: prices[20].date,
      name: 'Jane Smith',
      transactionCode: 'S',
      share: 5000,
      transactionPrice: prices[20].close + 1,
    },
  ];

  const news: CompanyNews[] = [
    {
      publishedAt: prices[10].date + 'T10:00:00Z',
      headline: `${symbol} Announces Record Quarterly Earnings`,
      url: '#',
    },
    {
      publishedAt: prices[25].date + 'T14:30:00Z',
      headline: `New Strategic Partnership for ${symbol} in AI Sector`,
      url: '#',
    },
  ];

  return { prices, insiderTransactions, news };
}
