const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

export async function fetchStockPrices(symbol: string) {
  try {
    const response = await fetch(
      `${ALPHA_VANTAGE_BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`
    );
    if (!response.ok) throw new Error('Failed to fetch stock prices');
    const data = await response.json();
    
    if (data['Note'] || data['Information']) {
      console.warn('Alpha Vantage API Limit Hit or Note:', data['Note'] || data['Information']);
      return [];
    }

    const timeSeries = data['Time Series (Daily)'] as Record<string, { '4. close': string }>;
    if (!timeSeries) return [];

    return Object.entries(timeSeries).map(([date, values]) => ({
      date,
      close: parseFloat(values['4. close']),
    })).reverse();
  } catch (error) {
    console.error('AV Fetch Error:', error);
    return [];
  }
}
