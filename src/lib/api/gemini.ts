import { GoogleGenAI } from '@google/genai';
import { StockData, InsiderTransaction } from '@/types';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

function analyzeOptionPatterns(transactions: InsiderTransaction[]) {
  const byPerson = new Map<string, InsiderTransaction[]>();
  
  transactions.forEach(t => {
    if (!byPerson.has(t.name)) {
      byPerson.set(t.name, []);
    }
    byPerson.get(t.name)!.push(t);
  });

  const patterns: string[] = [];

  byPerson.forEach((txns, name) => {
    const sorted = txns.sort((a, b) => a.transactionDate.localeCompare(b.transactionDate));
    
    const optionExercises = sorted.filter(t => t.transactionCode === 'M');
    const sells = sorted.filter(t => t.transactionCode === 'S');
    const buys = sorted.filter(t => ['P', 'A'].includes(t.transactionCode));
    
    if (optionExercises.length === 0) return;

    optionExercises.forEach(exercise => {
      const exerciseDate = new Date(exercise.transactionDate);
      const weekAfter = new Date(exerciseDate);
      weekAfter.setDate(weekAfter.getDate() + 7);
      
      const sellsAfterExercise = sells.filter(s => {
        const sellDate = new Date(s.transactionDate);
        return sellDate >= exerciseDate && sellDate <= weekAfter;
      });
      
      const totalExerciseShares = exercise.share;
      const totalSoldShares = sellsAfterExercise.reduce((sum, s) => sum + s.share, 0);
      
      if (sellsAfterExercise.length === 0) {
        patterns.push(`[긍정] ${name}: 옵션 행사 후 보유 (${totalExerciseShares.toLocaleString()}주) - 주가 상승 기대 시그널`);
      } else if (totalSoldShares >= totalExerciseShares * 0.9) {
        patterns.push(`[주의] ${name}: 옵션 행사 즉시 전량 매도 (${totalSoldShares.toLocaleString()}주) - 현금화 목적 또는 고점 인식 가능성`);
      } else if (totalSoldShares > 0 && totalSoldShares < totalExerciseShares * 0.5) {
        patterns.push(`[중립] ${name}: 옵션 행사 후 일부 매도 (${Math.round(totalSoldShares / totalExerciseShares * 100)}%) - 세금 납부용 추정`);
      }
    });
  });

  return patterns;
}

export async function generateAnalysis(symbol: string, data: StockData) {
  const optionPatterns = analyzeOptionPatterns(data.insiderTransactions);
  const optionAnalysis = optionPatterns.length > 0 
    ? `\n스톡옵션 행사 패턴 분석:\n${optionPatterns.join('\n')}\n` 
    : '';

  const prompt = `
    다음 ${symbol} 종목의 재무 데이터를 분석해주세요:
    
    내부자 거래:
    ${JSON.stringify(data.insiderTransactions)}
    ${optionAnalysis}
    최근 뉴스:
    ${JSON.stringify(data.news)}
    
    주가 흐름:
    ${JSON.stringify(data.prices)}
    
    [스톡옵션 행사 분석 가이드라인]
    내부자 스톡옵션 행사는 행사 이후 행동에 따라 시그널이 달라집니다:
    
    1. 긍정적 시그널 - "행사 후 보유": 옵션 행사 후 매도 없이 보유 → 주가 상승 기대
    2. 중립적 시그널 - "행사 후 즉시 매도": 보상 실현 목적, 단 여러 임원 동시 대량 매도 시 고점 신호
    3. 중립적 시그널 - "세금 납부용 일부 매도": 제도적 절차, 펀더멘털 무관
    
    주의점:
    - CEO, CFO 등 핵심 인물의 행보는 시그널 강도가 높음
    - 행사 가격 대비 현재가가 높은데도 보유하면 강한 긍정 시그널
    - 만기 임박 행사는 행정적 결정일 가능성
    
    작업:
    위 가이드라인을 참고하여 내부자 거래, 뉴스, 주가 움직임 간의 상관관계를 분석하고 투자자에게 핵심 인사이트를 제공해주세요.
    
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
    - 스톡옵션 행사 패턴이 있다면 반드시 분석에 포함
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
