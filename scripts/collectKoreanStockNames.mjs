import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const NAVER_API_BASE = 'https://api.stock.naver.com/stock';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getUSSymbols() {
  console.log('Fetching US stock symbols from Finnhub...');
  const url = `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${FINNHUB_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  
  const filtered = data.filter((s) => 
    s.type === 'Common Stock' && 
    !s.symbol.includes('.') &&
    !s.symbol.includes('-')
  );
  
  console.log(`Found ${filtered.length} US common stocks`);
  return filtered;
}

async function getKoreanName(symbol, mic) {
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
  if (!FINNHUB_API_KEY) {
    console.error('FINNHUB_API_KEY is required');
    process.exit(1);
  }

  const symbols = await getUSSymbols();
  
  const results = [];
  const failed = [];
  
  const outputPath = path.join(__dirname, '../src/lib/data/koreanStockNamesNaver.json');
  const progressPath = path.join(__dirname, 'progress.json');
  
  let startIndex = 0;
  if (fs.existsSync(progressPath)) {
    const progress = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));
    startIndex = progress.lastIndex || 0;
    results.push(...(progress.results || []));
    failed.push(...(progress.failed || []));
    console.log(`Resuming from index ${startIndex}, ${results.length} already collected`);
  }

  const total = symbols.length;
  const saveInterval = 50;
  
  for (let i = startIndex; i < total; i++) {
    const s = symbols[i];
    
    const koreanName = await getKoreanName(s.symbol, s.mic);
    
    if (koreanName) {
      results.push({
        symbol: s.symbol,
        nameEn: s.description,
        nameKr: koreanName,
        exchange: s.mic === 'XNAS' ? 'NASDAQ' : s.mic === 'XNYS' ? 'NYSE' : 'AMEX',
      });
      console.log(`[${i + 1}/${total}] ${s.symbol}: ${koreanName}`);
    } else {
      failed.push(s.symbol);
      if (i % 100 === 0) {
        console.log(`[${i + 1}/${total}] ${s.symbol}: not found`);
      }
    }

    if ((i + 1) % saveInterval === 0 || i === total - 1) {
      fs.writeFileSync(progressPath, JSON.stringify({
        lastIndex: i + 1,
        results,
        failed,
      }));
      
      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
      console.log(`--- Saved progress: ${results.length} stocks collected, ${failed.length} failed ---`);
    }

    await sleep(80);
  }

  console.log(`\n=== DONE ===`);
  console.log(`Total collected: ${results.length}`);
  console.log(`Total failed: ${failed.length}`);
  console.log(`Output: ${outputPath}`);
  
  if (fs.existsSync(progressPath)) {
    fs.unlinkSync(progressPath);
  }
}

main().catch(console.error);
