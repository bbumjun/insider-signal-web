# 🚀 Insider Signal - AI Stock Intelligence

내부자 거래, 주가 차트, 그리고 최신 뉴스를 AI로 통합 분석하여 투자 인사이트를 제공하는 웹 서비스입니다.

## 🛠 Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database/Cache**: Supabase
- **AI**: Google Gemini 2.0 Flash
- **Data APIs**: Finnhub (Insider/News), Yahoo Finance (Prices)
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Charts**: Lightweight Charts

---

## ☁️ Supabase의 역할 (The Role of Supabase)

이 프로젝트에서 Supabase는 단순히 데이터를 저장하는 공간을 넘어, 서비스의 효율성과 속도를 높이는 **"지능형 캐시 엔진"** 역할을 합니다.

### 1. AI 분석 결과 캐싱 (AI Insights Caching)
- Gemini AI는 호출할 때마다 비용(또는 무료 한도 소모)과 시간이 발생합니다.
- 특정 종목(예: AAPL)을 한 번 분석하면, 그 결과(Insight)를 Supabase에 **24시간 동안 저장**합니다.
- 다른 사용자가 같은 종목을 요청하면 AI를 다시 호출하지 않고 Supabase에서 즉시 꺼내 보여줍니다.

### 2. API 호출 최적화 (API Rate Limit Management)
- 외부 데이터 API(Finnhub, Alpha Vantage)는 무료 버전에서 하루 호출 횟수 제한이 매우 엄격합니다.
- Supabase에 한 번 가져온 데이터를 저장해둠으로써, 불필요한 중복 호출을 방지하고 서비스가 끊기지 않게 유지합니다.

### 3. 사용자 경험 가속화 (Performance)
- 미국에 있는 외부 API 서버보다 가까운 Supabase DB에서 데이터를 읽어오는 것이 훨씬 빠릅니다.

---

## ⚙️ Environment Variables (.env.local)

서비스 구동을 위해 다음 변수들이 필요합니다:

```env
# External APIs
FINNHUB_API_KEY=your_key
ALPHA_VANTAGE_API_KEY=your_key
GEMINI_API_KEY=your_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 🚀 Getting Started

```bash
npm install
npm run dev
```
