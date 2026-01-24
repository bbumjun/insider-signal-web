import * as fs from 'fs';
import * as path from 'path';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const NAVER_API_BASE = 'https://api.stock.naver.com/stock';

interface FinnhubSymbol {
  symbol: string;
  description: string;
  type: string;
  mic: string;
}

interface StockNameEntry {
  symbol: string;
  nameEn: string;
  nameKr: string;
  exchange: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function getUSSymbols(): Promise<FinnhubSymbol[]> {
  const exchanges = ['US'];
  const allSymbols: FinnhubSymbol[] = [];

  for (const exchange of exchanges) {
    const url = `https://finnhub.io/api/v1/stock/symbol?exchange=${exchange}&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    const filtered = data.filter((s: FinnhubSymbol) => 
      s.type === 'Common Stock' && 
      !s.symbol.includes('.') &&
      !s.symbol.includes('-')
    );
    
    allSymbols.push(...filtered);
  }

  return allSymbols;
}

async function getKoreanName(symbol: string, mic: string): Promise<string | null> {
  const suffixes = mic === 'XNAS' ? ['.O', ''] : ['', '.O'];
  
  for (const suffix of suffixes) {
    try {
      const url = `${NAVER_API_BASE}/${symbol}${suffix}/basic`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.stockName) {
          return data.stockName;
        }
      }
    } catch {
      continue;
    }
  }
  
  return null;
}

async function main() {
  console.log('Fetching US stock symbols from Finnhub...');
  const symbols = await getUSSymbols();
  console.log(`Found ${symbols.length} US stocks`);

  const results: StockNameEntry[] = [];
  const failed: string[] = [];
  
  const outputPath = path.join(__dirname, '../src/lib/data/koreanStockNamesNaver.json');
  const progressPath = path.join(__dirname, '../scripts/progress.json');
  
  let startIndex = 0;
  if (fs.existsSync(progressPath)) {
    const progress = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));
    startIndex = progress.lastIndex || 0;
    results.push(...(progress.results || []));
    failed.push(...(progress.failed || []));
    console.log(`Resuming from index ${startIndex}`);
  }

  const batchSize = 100;
  
  for (let i = startIndex; i < symbols.length; i++) {
    const s = symbols[i];
    
    const koreanName = await getKoreanName(s.symbol, s.mic);
    
    if (koreanName) {
      results.push({
        symbol: s.symbol,
        nameEn: s.description,
        nameKr: koreanName,
        exchange: s.mic === 'XNAS' ? 'NASDAQ' : s.mic === 'XNYS' ? 'NYSE' : 'AMEX',
      });
      console.log(`[${i + 1}/${symbols.length}] ${s.symbol}: ${koreanName}`);
    } else {
      failed.push(s.symbol);
      console.log(`[${i + 1}/${symbols.length}] ${s.symbol}: FAILED`);
    }

    if ((i + 1) % batchSize === 0) {
      fs.writeFileSync(progressPath, JSON.stringify({
        lastIndex: i + 1,
        results,
        failed,
      }, null, 2));
      console.log(`Progress saved at index ${i + 1}`);
    }

    await sleep(100);
  }

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nDone! Saved ${results.length} stocks to ${outputPath}`);
  console.log(`Failed: ${failed.length} stocks`);
  
  if (fs.existsSync(progressPath)) {
    fs.unlinkSync(progressPath);
  }
}

main().catch(console.error);
