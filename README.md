# Insider Signal - AI 주식 인텔리전스

내부자 거래, 주가 차트, 최신 뉴스를 AI로 통합 분석하여 **투자 인사이트**를 제공하는 웹 서비스입니다.

**Live Demo**: [insider-signal-web.vercel.app](https://insider-signal-web.vercel.app)

---

## 핵심 기능

### 통합 차트 뷰
- 주가 흐름과 내부자 거래를 하나의 차트에서 확인
- 매수/매도 히스토그램으로 거래량 시각화
- 뉴스 이벤트 마커 표시

### 스마트 마커 시스템
| 마커 | 의미 |
|------|------|
| 초록 원 | 내부자 매수 (옵션 행사, 주식 수여) |
| 노란 별(★) | **공개시장 매수** - 가장 강력한 긍정 시그널 |
| 빨간 원 | 내부자 매도 |
| 파란 원 | 뉴스 이벤트 |

### AI 패턴 분석 (Gemini)
- 내부자 거래 + 뉴스 + 주가의 상관관계 분석
- 스톡옵션 행사 패턴 자동 감지
- 실시간 스트리밍 응답

### 기업 스코어
- 6가지 재무 지표 기반 종합 점수
- 레이더 차트로 시각화

### Google 로그인 & 관심종목
- Google OAuth 로그인 지원
- 관심종목 추가/삭제 (Optimistic Update)

---

## 데이터 소스 & 처리

### 외부 API

| 소스 | 용도 | 데이터 |
|------|------|--------|
| **Yahoo Finance** | 주가 | 1년간 일봉 (OHLCV), 기업 프로필, 시가총액 |
| **Finnhub** | 내부자/뉴스 | 내부자 거래 내역, 기업 뉴스, 재무 지표 |
| **SEC EDGAR** | 재무제표 | 분기별 매출/순이익/영업이익 (10-Q, 10-K) |
| **Gemini AI** | 분석 | 통합 인사이트 생성 (스트리밍) |

### 데이터 흐름

```
[사용자] → [종목 검색]
              ↓
[Yahoo Finance] ← 주가, 기업 프로필
[Finnhub API]  ← 내부자 거래, 뉴스, 재무 지표
[SEC EDGAR]    ← 분기별 재무제표
              ↓
[전처리] → 옵션 행사 패턴 감지, 공개매수 감지
              ↓
[Gemini AI] → 통합 인사이트 생성 (스트리밍)
              ↓
[Supabase] → 캐싱
              ↓
[사용자] ← 분석 리포트
```

---

## 캐싱 전략

Supabase `api_cache` 테이블 기반 TTL 캐싱

| 데이터 | 캐시 키 | TTL | 비고 |
|--------|---------|-----|------|
| AI 인사이트 | `ai_insights` 테이블 | 당일 자정까지 | GET으로 캐시 확인, MISS 시 POST로 생성 |
| 기업 프로필 | `company_profile_v4:{symbol}` | 30일 | Gemini로 한국어 요약 포함 |
| 내부자 거래 | `insider:{symbol}` | 1시간 | |
| 뉴스 | `news_accumulated:{symbol}` | 영구 | 누적 저장, 1시간마다 신규 뉴스 병합 |
| 재무 지표 | `metrics:{symbol}` | 1시간 | Finnhub 지표 |
| SEC 재무제표 | `sec-facts:{cik}` | 24시간 | |
| 종목 검색 | `search:{query}` | 24시간 | |

### 캐시 히트 최적화
- AI 인사이트: GET 요청으로 캐시만 확인 (body 없이 빠르게)
- 캐시 미스 시에만 POST로 데이터 전송하여 생성

---

## 기업 스코어 계산

Finnhub API의 재무 지표를 0-100 점수로 정규화

| 스코어 | 원본 지표 | 범위 | 계산 방식 |
|--------|-----------|------|-----------|
| **수익성** | ROE (TTM) | -10% ~ 40% | 높을수록 좋음 |
| **성장성** | 매출 성장률 (YoY) | -20% ~ 50% | 높을수록 좋음 |
| **마진** | 영업이익률 (TTM) | -10% ~ 40% | 높을수록 좋음 |
| **안정성** | 유동비율 | 0.5 ~ 3.0 | 높을수록 좋음 |
| **현금흐름** | FCF CAGR 5년 | -20% ~ 30% | 높을수록 좋음 |
| **밸류에이션** | PEG | 0 ~ 3 | **낮을수록 좋음** (inverse) |

**종합 점수** = 6개 항목 단순 평균

**정규화 공식:**
```
score = (clamp(value, min, max) - min) / (max - min) * 100
```
- 데이터 없으면: 50점 (중립)

---

## AI 분석 로직

### 분석 우선순위

| 순위 | 항목 | 비중 | 설명 |
|------|------|------|------|
| 1 | 뉴스 분석 | 40% | 실적, M&A, 신제품, 소송 등 이벤트 파악 |
| 2 | 공개시장 매수 | 30% | 코드 P - 가장 강력한 긍정 시그널 |
| 3 | 주가 흐름 | 20% | 최근 추세, 뉴스와의 연관성 |
| 4 | 내부자 매도 | 10% | 대부분 무시, 집단 대량 매도만 언급 |

### 옵션 행사 패턴 감지

AI 프롬프트 전 자동 분석:

| 패턴 | 판정 | 의미 |
|------|------|------|
| 옵션 행사 후 7일 내 매도 없음 | 긍정 | 주가 상승 기대 |
| 옵션 행사 후 90%+ 매도 | 주의 | 현금화 또는 고점 인식 |
| 옵션 행사 후 50% 미만 매도 | 중립 | 세금 납부용 추정 |

### 시그널 강도 (1-5)

```
매수 시그널:
- 공개매수 있음: 4-5
- 긍정 뉴스: 3
- 특이사항 없음: 1-2

매도 시그널:
- C-level 집단 대량 매도: 3-5
- 그 외: 1-2
```

---

## 내부자 거래 해석 가이드

### Transaction Code

| 코드 | 의미 | 시그널 |
|------|------|--------|
| **P** | 공개시장 매수 | ⭐⭐⭐ 가장 강력한 긍정 |
| **S** | 공개시장 매도 | 부정적 (맥락에 따라 다름) |
| **M** | 옵션 행사 | 중립 (이후 행동 중요) |
| **A** | 주식 수여 | 중립 |
| **F** | 세금 납부용 매도 | 무시 가능 |
| **G** | 증여 | 무시 가능 |

### 핵심 체크 포인트

- **누가?**: CEO/CFO의 거래는 시그널 강도가 높음
- **얼마나?**: 대규모 공개 매수일수록 강한 확신
- **언제?**: 실적 발표 전후 거래에 주목
- **패턴?**: 여러 임원 동시 매도 = 고점 신호 가능성

---

## 프로젝트 구조

```
insider-signal-web/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 홈 (검색, 관심종목, 핫 인사이더)
│   │   ├── stock/[symbol]/
│   │   │   ├── page.tsx                # 종목 분석 (SSR)
│   │   │   ├── timeline/page.tsx       # 전체 타임라인
│   │   │   └── fundamentals/page.tsx   # 재무제표
│   │   └── api/
│   │       ├── search/                 # 종목 검색
│   │       ├── stock/[symbol]/
│   │       │   ├── analysis/           # AI 분석 (GET: 캐시, POST: 생성)
│   │       │   ├── profile/            # 기업 프로필
│   │       │   ├── financials/         # SEC 재무제표
│   │       │   └── scores/             # 기업 스코어
│   │       ├── watchlist/              # 관심종목 CRUD
│   │       └── insider-screener/       # 핫 인사이더 매수
│   ├── components/
│   │   ├── Timeline/
│   │   │   ├── TimelineChart.tsx       # 주가 + 거래 차트
│   │   │   └── ActivityTimeline.tsx    # 활동 타임라인
│   │   ├── InsightPanel.tsx            # AI 인사이트
│   │   ├── CompanyDescription.tsx      # 기업 소개
│   │   ├── ScoreRadarChart.tsx         # 스코어 레이더 차트
│   │   └── SearchBar.tsx               # 종목 검색
│   ├── lib/
│   │   ├── api/
│   │   │   ├── finnhub.ts              # 내부자 거래, 뉴스
│   │   │   ├── gemini.ts               # AI 분석 + 패턴 감지
│   │   │   ├── financials.ts           # 기업 스코어 계산
│   │   │   ├── companyProfile.ts       # 기업 프로필 + 번역
│   │   │   └── sec-edgar.ts            # SEC 재무제표
│   │   ├── cache/
│   │   │   └── supabaseCache.ts        # 캐시 유틸리티
│   │   └── supabase/                   # Supabase 클라이언트
│   └── types/                          # TypeScript 인터페이스
└── public/
```

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Charts** | Lightweight Charts |
| **Auth** | NextAuth.js (Google OAuth) |
| **AI** | Google Gemini 2.5 Flash |
| **Database** | Supabase (PostgreSQL) |
| **Data** | Yahoo Finance, Finnhub, SEC EDGAR |
| **Deploy** | Vercel |

---

## 환경 변수

```env
# AI
GEMINI_API_KEY=your_gemini_api_key

# Data APIs
FINNHUB_API_KEY=your_finnhub_api_key

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Auth (Google OAuth)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
AUTH_SECRET=your_auth_secret  # openssl rand -base64 32
```

---

## 로컬 개발

```bash
# 클론
git clone https://github.com/bbumjun/insider-signal-web.git
cd insider-signal-web

# 의존성 설치
bun install  # 또는 npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일에 API 키 입력

# 개발 서버 실행
bun dev  # 또는 npm run dev

# http://localhost:3000
```

---

## 라이선스

MIT License
