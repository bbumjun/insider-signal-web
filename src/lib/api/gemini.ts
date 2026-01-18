import { GoogleGenAI } from '@google/genai';
import { StockData } from '@/types';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function generateAnalysis(symbol: string, data: StockData) {
  const prompt = `
    다음 ${symbol} 종목의 재무 데이터를 분석해주세요:
    
    내부자 거래:
    ${JSON.stringify(data.insiderTransactions)}
    
    최근 뉴스:
    ${JSON.stringify(data.news)}
    
    주가 흐름:
    ${JSON.stringify(data.prices)}
    
    작업:
    내부자 거래, 뉴스, 주가 움직임 간의 상관관계를 분석해주세요.
    
    응답 형식:
    1. 주요 패턴 (bullet points)
    2. 실행 가능한 인사이트 (한 문장)
    
    중요: 응답은 반드시 한국어로 작성해주세요.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt,
  });
  
  if (!response.text) {
    throw new Error('Empty response from Gemini');
  }
  
  return response.text;
}
