# 🚀 Insider Signal - AI 주식 인텔리전스

내부자 거래, 주가 차트, 최신 뉴스를 AI로 통합 분석하여 **투자 인사이트**를 제공하는 웹 서비스입니다.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/bbumjun/insider-signal-web)

**Live Demo**: [insider-signal-web.vercel.app](https://insider-signal-web.vercel.app)

---

## 📸 스크린샷

### 메인 대시보드
![Dashboard](https://via.placeholder.com/800x450?text=Dashboard+Screenshot)

### AI 분석 리포트
![AI Analysis](https://via.placeholder.com/800x450?text=AI+Analysis+Screenshot)

> 실제 스크린샷으로 교체 예정

---

## ✨ 핵심 기능

### 📊 통합 차트 뷰
- 주가 흐름과 내부자 거래를 하나의 차트에서 확인
- 매수/매도 히스토그램으로 거래량 시각화
- 뉴스 이벤트 마커 표시

### 🎯 스마트 마커 시스템
| 마커 | 의미 |
|------|------|
| 🟢 초록 원 | 내부자 매수 (옵션 행사, 주식 수여) |
| 🟡 노란 별(★) | **공개시장 매수** - 가장 강력한 긍정 시그널 |
| 🔴 빨간 원 | 내부자 매도 |
| 🔵 파란 원 | 뉴스 이벤트 |

### 💬 인터랙티브 툴팁
- 마커 호버 시 상세 거래 정보 표시
- 동일 인물의 거래는 자동 합산
- 거래 유형별 분류 (공개시장 매수, 옵션 행사 등)

### 🤖 AI 패턴 분석 (Gemini)
- 내부자 거래 + 뉴스 + 주가의 상관관계 분석
- 스톡옵션 행사 패턴 자동 감지
- 구조화된 요약 리포트 제공:
  - 📊 핵심 요약
  - 🎯 주요 발견
  - ⚠️ 주의사항
  - 💡 투자 관점

### ⭐ 공개 매수 강조
- 차트에서 노란색 별 마커로 강조
- 타임라인에서 "강력 시그널" 배지 표시
- AI 분석에서 최우선 언급

---

## 📖 내부자 거래 해석 가이드

### Transaction Code 의미

| 코드 | 의미 | 시그널 |
|------|------|--------|
| **P** | 공개시장 매수 (Open Market Purchase) | ⭐⭐⭐ 가장 강력한 긍정 |
| **S** | 공개시장 매도 (Open Market Sale) | 부정적 (맥락에 따라 다름) |
| **M** | 옵션 행사 (Option Exercise) | 중립 (이후 행동 중요) |
| **A** | 주식 수여 (Award) | 중립 |
| **F** | 세금 납부용 매도 | 무시 가능 |
| **G** | 증여 (Gift) | 무시 가능 |

### 스톡옵션 행사 패턴 해석

1. **행사 후 보유** → 🟢 긍정: 주가 상승 기대
2. **행사 즉시 전량 매도** → 🟡 주의: 현금화 또는 고점 인식
3. **일부 매도 (50% 미만)** → ⚪ 중립: 세금 납부용 추정

### 핵심 체크 포인트

- **누가?**: CEO/CFO의 거래는 시그널 강도가 높음
- **얼마나?**: 대규모 공개 매수일수록 강한 확신
- **언제?**: 실적 발표 전후 거래에 주목
- **패턴?**: 여러 임원 동시 매도 = 고점 신호 가능성

---

## 🏗 프로젝트 구조

```
insider-signal-web/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # 홈페이지 (검색)
│   │   ├── stock/[symbol]/page.tsx  # 종목 분석 페이지
│   │   └── api/
│   │       ├── search/route.ts      # 종목 검색 API
│   │       └── stock/[symbol]/
│   │           └── analysis/route.ts # AI 분석 API
│   ├── components/
│   │   ├── SearchBar.tsx            # 종목 검색
│   │   ├── PeriodSelector.tsx       # 기간 선택 (1M/3M/1Y)
│   │   ├── InsightPanel.tsx         # AI 인사이트 패널
│   │   └── Timeline/
│   │       ├── TimelineChart.tsx    # 주가 + 거래 차트
│   │       └── ActivityTimeline.tsx # 활동 타임라인
│   └── lib/
│       ├── api/
│       │   ├── finnhub.ts           # 내부자 거래, 뉴스 API
│       │   └── gemini.ts            # AI 분석 + 패턴 감지
│       └── cache/
│           └── supabaseCache.ts     # 24시간 캐싱
├── .env.local                       # 환경변수
└── package.json
```

### 데이터 흐름

```
[사용자] → [종목 검색]
              ↓
[Yahoo Finance] ← 주가 데이터
[Finnhub API]  ← 내부자 거래, 뉴스
              ↓
[패턴 분석] → 옵션 행사 패턴, 공개 매수 감지
              ↓
[Gemini AI] → 통합 인사이트 생성
              ↓
[Supabase] → 24시간 캐싱
              ↓
[사용자] ← 분석 리포트
```

---

## 🛠 기술 스택

| 영역 | 기술 |
|------|------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Charts** | Lightweight Charts |
| **Icons** | Lucide React |
| **AI** | Google Gemini 2.5 Flash Lite |
| **Cache** | Supabase |
| **Data** | Yahoo Finance, Finnhub API |
| **Deploy** | Vercel |

---

## ⚙️ 환경 변수

```env
# AI
GEMINI_API_KEY=your_gemini_api_key

# Data APIs
FINNHUB_API_KEY=your_finnhub_api_key

# Cache (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🚀 시작하기

### 로컬 개발

```bash
# 1. 클론
git clone https://github.com/bbumjun/insider-signal-web.git
cd insider-signal-web

# 2. 의존성 설치
bun install  # 또는 npm install

# 3. 환경변수 설정
cp .env.example .env.local
# .env.local 파일에 API 키 입력

# 4. 개발 서버 실행
bun dev  # 또는 npm run dev

# 5. 브라우저에서 확인
open http://localhost:3000
```

### Vercel 배포

1. [Vercel](https://vercel.com)에 GitHub 레포 연결
2. Environment Variables에 API 키 추가
3. Deploy!

---

## ☁️ Supabase 캐싱 전략

### 왜 캐싱이 필요한가?

| 문제 | 해결책 |
|------|--------|
| Gemini API 호출 비용/시간 | 24시간 캐싱으로 중복 호출 방지 |
| Finnhub 무료 한도 (60 calls/min) | 캐싱으로 API 호출 최소화 |
| 사용자 대기 시간 | 캐시 히트 시 즉시 응답 |

### 캐시 정책

- **TTL**: 24시간
- **키 구조**: `{symbol}:{period}:analysis`
- **무효화**: TTL 만료 시 자동 갱신

---

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포할 수 있습니다.

---

## 🤝 기여하기

1. Fork this repo
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

### 기여 아이디어

- [ ] 다크/라이트 모드 토글
- [ ] 관심 종목 저장 기능
- [ ] 알림 기능 (특정 패턴 감지 시)
- [ ] 한국 주식 지원 (KRX)
- [ ] 모바일 반응형 개선

---

## 📬 문의

- **GitHub Issues**: 버그 리포트, 기능 제안
- **Email**: bumjun2952@gmail.com

---

Made with ☕ by [@bbumjun](https://github.com/bbumjun)
