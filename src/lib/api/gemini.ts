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
    내부자 거래, 뉴스, 주가 움직임 간의 상관관계를 분석하여 투자자에게 핵심 인사이트를 제공해주세요.
    
    응답 형식 (반드시 아래 구조를 따라주세요):
    
    📊 핵심 요약
    [한 줄로 핵심 투자 시그널 요약]
    
    🎯 주요 발견
    • [발견 1]
    • [발견 2]
    • [발견 3]
    
    ⚠️ 주의사항
    • [리스크 요인 1]
    • [리스크 요인 2]
    
    💡 투자 관점
    [실행 가능한 인사이트 1-2문장]
    
    중요:
    - 응답은 반드시 한국어로 작성
    - 각 섹션은 간결하고 명확하게
    - 이모지를 포함한 정확한 형식 준수
    - 불필요한 설명 제거, 핵심만 전달
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
