import fs from 'fs';
import path from 'path';
import { KOREAN_STOCK_MAP } from './koreanStockNames';

interface NaverStockEntry {
  symbol: string;
  nameEn: string;
  nameKr: string;
  exchange: string;
}

interface SearchResult {
  symbol: string;
  nameEn: string;
  nameKr: string;
}

let naverStockData: NaverStockEntry[] | null = null;

function loadNaverData(): NaverStockEntry[] {
  if (naverStockData) return naverStockData;
  
  try {
    const filePath = path.join(process.cwd(), 'src/lib/data/koreanStockNamesNaver.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      naverStockData = data;
      return naverStockData || [];
    }
  } catch {
    return [];
  }
  return [];
}

export function hasKoreanCharacters(text: string): boolean {
  return /[가-힣]/.test(text);
}

export function searchKoreanStocksAsync(query: string): SearchResult[] {
  const normalizedQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];
  const seenSymbols = new Set<string>();

  const naverData = loadNaverData();
  
  if (naverData.length > 0) {
    const naverResults = naverData
      .filter((stock) => {
        if (stock.nameKr.toLowerCase().includes(normalizedQuery)) return true;
        if (stock.symbol.toLowerCase().includes(normalizedQuery)) return true;
        if (stock.nameEn.toLowerCase().includes(normalizedQuery)) return true;
        return false;
      })
      .slice(0, 15);
    
    for (const stock of naverResults) {
      if (!seenSymbols.has(stock.symbol)) {
        seenSymbols.add(stock.symbol);
        results.push({
          symbol: stock.symbol,
          nameEn: stock.nameEn,
          nameKr: stock.nameKr,
        });
      }
    }
  }

  const manualResults = KOREAN_STOCK_MAP.filter((stock) => {
    if (seenSymbols.has(stock.symbol)) return false;
    if (stock.nameKr.includes(normalizedQuery)) return true;
    if (stock.aliases?.some((alias) => alias.toLowerCase().includes(normalizedQuery))) return true;
    if (stock.symbol.toLowerCase().includes(normalizedQuery)) return true;
    if (stock.nameEn.toLowerCase().includes(normalizedQuery)) return true;
    return false;
  });

  for (const stock of manualResults) {
    if (!seenSymbols.has(stock.symbol)) {
      seenSymbols.add(stock.symbol);
      results.push({
        symbol: stock.symbol,
        nameEn: stock.nameEn,
        nameKr: stock.nameKr,
      });
    }
  }

  return results.slice(0, 10);
}
