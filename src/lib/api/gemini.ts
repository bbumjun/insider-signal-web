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
    다음 ${symbol} 종목을 분석해주세요:
    
    [1. 뉴스 - 가장 중요]
    ${JSON.stringify(data.news)}
    
    [2. 내부자 거래]
    ${JSON.stringify(data.insiderTransactions)}
    ${openMarketAnalysis}${optionAnalysis}
    
    [3. 주가 흐름]
    ${JSON.stringify(data.prices)}
    
    ===== 분석 우선순위 =====
    
    1순위: 뉴스 분석 (40%)
    - 실적 발표, 가이던스, M&A, 신제품, 소송, 경영진 변동 등 주가에 영향을 미치는 이벤트 파악
    - 뉴스 톤(긍정/부정/중립) 판단
    - 최근 뉴스와 주가 흐름의 상관관계 분석
    - 향후 주가에 영향을 줄 수 있는 예정된 이벤트 언급
    
    2순위: 공개시장 매수 (30%)
    - 코드 P (Open Market Purchase)만 해당
    - 내부자가 자기 돈으로 직접 매수 = 가장 강력한 긍정 시그널
    - 매수 규모, 매수자 직급 강조
    
    3순위: 내부자 매도 (10%) - 대부분 무시
    - 일반적인 매도는 분석에서 제외 (예측력 없음)
    - 다음 경우에만 언급:
      * 여러 C-level 임원이 동시에 대량 매도
      * 단일 거래가 $10M 이상인 경우
    - 소규모 매도, 옵션 행사 후 매도, 세금 목적 매도는 무시
    
    4순위: 주가 흐름 (20%)
    - 최근 추세 (상승/하락/횡보)
    - 뉴스/내부자 거래와의 연관성
    
    ===== 응답 형식 =====
    
    📊 핵심 요약
    [뉴스 기반 핵심 판단 1-2문장. 내부자 매수가 있으면 함께 언급]
    
    📈 시그널 강도
    <!--SIGNAL:{"buy":3,"sell":2}-->
    (buy: 공개매수 있으면 4-5, 긍정 뉴스면 3, 없으면 1-2)
    (sell: 대규모 집단 매도 있을 때만 3-5, 그 외 1-2)
    
    📰 뉴스 분석
    • [주요 뉴스 1 - 영향도 평가]
    • [주요 뉴스 2]
    • [향후 예정 이벤트가 있다면]
    
    🎯 주요 발견
    • [공개매수가 있다면 최우선 언급]
    • [뉴스-주가 연관성]
    • [특이사항]
    
    💡 투자 관점
    • 단기: [뉴스 기반 전망]
    • 모니터링: [주목할 이벤트/지표]
    
    ===== 규칙 =====
    - 일반적인 내부자 매도는 언급하지 말 것
    - 뉴스가 없으면 "최근 주요 뉴스 없음"으로 표시
    - 체언 종결 ("~임", "~함")
    - 각 bullet 25자 이내
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
