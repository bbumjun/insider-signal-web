import { promises as fs } from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'ai-insights.json');
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface CacheEntry {
  content: string;
  generatedAt: number;
}

interface CacheStore {
  [symbol: string]: CacheEntry;
}

async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch {}
}

async function readCache(): Promise<CacheStore> {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeCache(store: CacheStore) {
  await ensureCacheDir();
  await fs.writeFile(CACHE_FILE, JSON.stringify(store, null, 2));
}

export async function getCachedInsight(symbol: string): Promise<string | null> {
  const store = await readCache();
  const entry = store[symbol.toUpperCase()];
  
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.generatedAt > CACHE_TTL_MS) {
    return null;
  }
  
  return entry.content;
}

export async function setCachedInsight(symbol: string, content: string) {
  const store = await readCache();
  store[symbol.toUpperCase()] = {
    content,
    generatedAt: Date.now(),
  };
  await writeCache(store);
}
