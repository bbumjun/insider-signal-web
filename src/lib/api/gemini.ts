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
    
    [내부자 거래 분석 가이드라인 - 학술 연구 기반]
    
    ★★★ 공개시장 매수 (코드 P) - 가장 강력한 긍정 시그널 ★★★
    - 내부자가 자기 돈으로 공개시장에서 직접 매수
    - 주가가 저평가되어 있거나 향후 상승을 확신한다는 증거
    - 연구 결과: 내부자 매수는 월 50-67bp 초과수익률 (Jeng, Metrick, Zeckhauser)
    
    ★★ 내부자 매도 해석 - 주의 필요 ★★
    [중요] 연구에 따르면 내부자 매도는 매수보다 예측력이 현저히 낮음 (Lakonishok & Lee, 2001)
    
    1. 중립적 매도 (대부분의 경우):
       - 소규모 매도 (보유 지분 10% 미만) → 포트폴리오 다각화, 오히려 긍정적 수익률과 상관 (Scott & Xu, 2004)
       - 주가 상승 후 매도 → 차익실현, 일반적 패턴
       - 옵션 행사 후 일부 매도 → 세금 납부, 리스크 감소 목적
       - 정기적 매도 (10b5-1 플랜) → 사전 계획된 매도
    
    2. 주의 필요한 매도 (드문 경우):
       - 대규모 매도 (보유 지분 25% 이상) → 정보 기반 매도 가능성
       - 여러 임원 동시 매도 → 집단적 고점 인식 가능성
       - 주가 하락 중 매도 → 비정상 패턴, 추가 하락 가능성
    
    3. 매도 시그널 강도 판단 기준:
       - 매도 규모 / 보유 지분 비율 확인
       - 매도 전 주가 추세 확인 (상승 후 매도 = 중립)
       - 동시 매도 임원 수 확인
    
    [스톡옵션 행사 분석]
    1. 긍정적: 행사 후 보유 → 주가 상승 기대
    2. 중립적: 행사 후 매도 → 보상 실현, 리스크 감소 (정보 기반 아님)
    3. 주의: 여러 임원 동시 대량 매도 시에만 고점 신호 가능
    
    작업:
    위 연구 기반 가이드라인을 참고하여 분석하세요. 특히 매도의 경우 "매도 = 부정적"이라는 단순 해석을 피하고, 매도 규모, 패턴, 맥락을 종합 판단하세요.
    
    응답 형식 (반드시 아래 구조를 따라주세요):
    
    📊 핵심 요약
    [구체적 수치와 함께 핵심 판단 - 예: "CEO $2.3M 공개매수, 강한 확신 시그널" 또는 "소규모 분산 매도, 일상적 포트폴리오 조정"]
    
    📈 시그널 강도
    매수 시그널: [1-5점] | 매도 시그널: [1-5점]
    (공개매수 존재 시 매수 4-5점, 소규모 분산 매도는 매도 1-2점으로 낮게)
    
    🎯 주요 발견
    • [구체적 수치 포함 - 예: "CFO 3회 분할매수 총 $1.2M"]
    • [발견 2]
    • [발견 3]
    
    ⚠️ 주의사항
    • [실제 리스크만 언급, 일반적 매도는 리스크 아님]
    
    💡 투자 관점
    • 단기(1-4주): [구체적 액션]
    • 트리거: [조건부 액션]
    
    중요:
    - 내부자 매도만으로 부정적 판단 금지 (연구상 예측력 낮음)
    - 매도 해석 시 반드시 규모/맥락 언급
    - 공개시장 매수가 있다면 가장 강조
    - 모호한 표현 금지, 구체적 수치와 판단 제시
    
    문체 규칙:
    - 체언 종결 ("~임", "~함")
    - 각 bullet 20자 이내
    - 마크다운 강조 금지
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
