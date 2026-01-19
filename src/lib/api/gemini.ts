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

function analyzeOpenMarketBuys(transactions: InsiderTransaction[]) {
  const openMarketBuys = transactions.filter(t => t.transactionCode === 'P');
  if (openMarketBuys.length === 0) return '';

  const totalValue = openMarketBuys.reduce((sum, t) => sum + (t.share * (t.transactionPrice || 0)), 0);
  const buyers = [...new Set(openMarketBuys.map(t => t.name))];
  
  const formatValue = (v: number) => {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
    if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
    return `$${v.toFixed(0)}`;
  };

  return `
⭐ 공개시장 매수 감지 (강력 긍정 시그널):
- 총 ${openMarketBuys.length}건, ${formatValue(totalValue)} 규모
- 매수자: ${buyers.join(', ')}
- 내부자가 자기 돈으로 공개시장에서 직접 매수한 것으로, 가장 강력한 긍정 시그널입니다.
`;
}

export async function generateAnalysis(symbol: string, data: StockData) {
  const optionPatterns = analyzeOptionPatterns(data.insiderTransactions);
  const optionAnalysis = optionPatterns.length > 0 
    ? `\n스톡옵션 행사 패턴 분석:\n${optionPatterns.join('\n')}\n` 
    : '';
  
  const openMarketAnalysis = analyzeOpenMarketBuys(data.insiderTransactions);

  const prompt = `
    다음 ${symbol} 종목의 재무 데이터를 분석해주세요:
    
    내부자 거래:
    ${JSON.stringify(data.insiderTransactions)}
    ${openMarketAnalysis}${optionAnalysis}
    최근 뉴스:
    ${JSON.stringify(data.news)}
    
    주가 흐름:
    ${JSON.stringify(data.prices)}
    
    [내부자 거래 분석 가이드라인]
    
    ★★★ 공개시장 매수 (코드 P) - 가장 강력한 긍정 시그널 ★★★
    - 내부자가 자기 돈으로 공개시장에서 직접 매수
    - 주가가 저평가되어 있거나 향후 상승을 확신한다는 증거
    - 공개 매수가 있다면 반드시 핵심 요약과 주요 발견에 강조해서 언급
    
    [스톡옵션 행사 분석]
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
    
    📈 시그널 강도
    매수 시그널: [1-5점] | 매도 시그널: [1-5점]
    (내부자 거래 패턴, 거래량, 인물 중요도 기반)
    
    🎯 주요 발견
    • [발견 1]
    • [발견 2]
    • [발견 3]
    
    ⚠️ 주의사항
    • [리스크 요인 1]
    • [리스크 요인 2]
    
    💡 투자 관점
    • 단기(1-4주): [구체적 액션 - 예: "관망", "분할매수 고려", "차익실현 검토"]
    • 트리거: [조건부 액션 - 예: "$XX 이탈 시 손절", "실적발표 후 재평가", "추가 내부자 매수 시 비중확대"]
    
    중요:
    - 응답은 반드시 한국어로 작성
    - 각 섹션은 간결하고 명확하게
    - 이모지를 포함한 정확한 형식 준수
    - 불필요한 설명 제거, 핵심만 전달
    - 공개시장 매수(P)가 있다면 가장 먼저, 가장 강조해서 언급
    - 스톡옵션 행사 패턴이 있다면 분석에 포함
    - "신중한 접근 필요" 같은 모호한 표현 금지, 구체적 액션 제시
    
    문체 규칙 (매우 중요):
    - "~입니다", "~합니다" 대신 "~임", "~함" 체언 종결 사용
    - 예: "불확실성이 존재합니다" → "불확실성 존재"
    - 예: "매도가 많습니다" → "매도 다수"
    - 예: "긍정적입니다" → "긍정적"
    - **강조** 마크다운 사용 금지, 그냥 텍스트로 작성
    - 각 bullet point는 20자 이내로 간결하게
  `;

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      
      if (!response.text) {
        throw new Error('Empty response from Gemini');
      }
      
      return response.text;
    } catch (error) {
      lastError = error as Error;
      const isRetryable = lastError.message?.includes('503') || 
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
