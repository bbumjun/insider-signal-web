import { GoogleGenAI } from '@google/genai';
import YahooFinance from 'yahoo-finance2';
import { withCache } from '@/lib/cache/supabaseCache';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const yahooFinance = new YahooFinance();

export interface CompanyProfile {
  symbol: string;
  name: string;
  sector: string | null;
  industry: string | null;
  description: string;
  website: string | null;
  employees: number | null;
  country: string | null;
}

interface YahooAssetProfile {
  longBusinessSummary?: string;
  sector?: string;
  industry?: string;
  website?: string;
  fullTimeEmployees?: number;
  country?: string;
}

async function translateAndSummarize(englishText: string, companyName: string): Promise<string> {
  const prompt = `다음은 "${companyName}" 기업에 대한 영문 설명입니다. 
이를 한국어로 번역하고 핵심만 2-3문장으로 요약해주세요.
투자자가 이 기업이 무엇을 하는 회사인지 빠르게 파악할 수 있도록 작성해주세요.

영문 설명:
${englishText}

규칙:
- 2-3문장으로 간결하게
- 주요 사업 영역과 핵심 제품/서비스 언급
- 마크다운 사용 금지
- 문장은 "~하는 기업이다", "~를 제공한다" 등 서술형으로 종결`;

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (!response.text) {
        throw new Error('Empty response from Gemini');
      }

      return response.text.trim();
    } catch (error) {
      lastError = error as Error;
      const isRetryable =
        lastError.message?.includes('503') ||
        lastError.message?.includes('overloaded') ||
        lastError.message?.includes('UNAVAILABLE');

      if (isRetryable && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error('Failed after retries');
}

async function fetchCompanyProfileRaw(symbol: string): Promise<CompanyProfile> {
  const [quoteSummary, quote] = await Promise.all([
    yahooFinance.quoteSummary(symbol, { modules: ['assetProfile'] }).catch(() => null),
    yahooFinance.quote(symbol).catch(() => null),
  ]);

  const assetProfile = quoteSummary?.assetProfile as YahooAssetProfile | undefined;
  const companyName = quote?.shortName || quote?.longName || symbol;

  let description = '기업 정보를 불러올 수 없습니다.';

  if (assetProfile?.longBusinessSummary) {
    try {
      description = await translateAndSummarize(assetProfile.longBusinessSummary, companyName);
    } catch (error) {
      console.error('Failed to translate company description:', error);
      description = '기업 설명을 번역하는 중 오류가 발생했습니다.';
    }
  }

  return {
    symbol: symbol.toUpperCase(),
    name: companyName,
    sector: assetProfile?.sector || null,
    industry: assetProfile?.industry || null,
    description,
    website: assetProfile?.website || null,
    employees: assetProfile?.fullTimeEmployees || null,
    country: assetProfile?.country || null,
  };
}

export async function fetchCompanyProfile(symbol: string): Promise<CompanyProfile> {
  const cacheKey = `company_profile:${symbol.toUpperCase()}`;

  return withCache(cacheKey, () => fetchCompanyProfileRaw(symbol), { ttlMinutes: 60 * 24 });
}
