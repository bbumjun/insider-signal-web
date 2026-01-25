import { GoogleGenAI } from '@google/genai';
import YahooFinance from 'yahoo-finance2';
import { withCacheMeta, CachedResult } from '@/lib/cache/supabaseCache';

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
  marketCap: number | null;
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
  const prompt = `"${companyName}" 기업 설명을 한국어로 요약해줘.

영문 설명:
${englishText}

출력 형식:
• [핵심 사업 한 줄 요약]
• [주요 제품/서비스]
• [적용 분야 또는 고객군]

규칙:
- 위 형식대로 bullet point 3개로만 작성
- 각 bullet은 50자 이내로 작성
- "한국어 번역", "요약" 같은 메타 문구 절대 금지
- 회사명으로 시작하지 말 것
- 마크다운 사용 금지 (• 만 사용)`;

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
    marketCap: quote?.marketCap || null,
  };
}

export async function fetchCompanyProfile(symbol: string): Promise<CachedResult<CompanyProfile>> {
  const cacheKey = `company_profile_v4:${symbol.toUpperCase()}`;

  return withCacheMeta(cacheKey, () => fetchCompanyProfileRaw(symbol), {
    ttlMinutes: 60 * 24 * 30,
  });
}
