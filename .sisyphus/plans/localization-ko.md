# Insider Signal 한국어화 (Localization)

## Context

### Original Request
전체 UI를 한국어로 변경하여 한국 사용자 대상 서비스로 전환

### Interview Summary
**Key Discussions**:
- 한국 대상 서비스로 모든 UI 텍스트 한국어화
- AI 분석 결과도 한국어로 출력되도록 프롬프트 변경

**User Decisions**:
- 폰트: **Pretendard** 추가 (한국어 웹폰트)
- 통화: **USD 유지** ($123.45)
- 기간 레이블: **한국어** (1개월, 3개월, 1년)
- AI 캐시: **무효화** (기존 영어 응답 삭제)

### Metis Review
**Identified Gaps** (addressed):
- `layout.tsx` 누락 → 추가됨 (lang="ko", metadata)
- `PeriodSelector.tsx` 누락 → 추가됨 (기간 레이블)
- 한국어 폰트 필요 → Pretendard 추가 결정
- AI 캐시 영어 응답 → 무효화 결정

---

## Work Objectives

### Core Objective
Insider Signal 웹 애플리케이션의 모든 사용자 대면 텍스트를 한국어로 번역하고, Pretendard 폰트를 적용하여 한국 사용자를 위한 일관된 경험 제공

### Concrete Deliverables
- 9개 파일의 UI 텍스트 한국어화
- Pretendard 폰트 적용
- AI 프롬프트 한국어 응답 유도
- Supabase AI 캐시 무효화
- Vercel 재배포

### Definition of Done
- [ ] 모든 사용자 대면 텍스트가 한국어로 표시됨
- [ ] AI 인사이트가 한국어로 생성됨
- [ ] Pretendard 폰트가 적용되어 한국어가 일관되게 렌더링됨
- [ ] `npm run build` 성공
- [ ] Vercel 배포 성공

### Must Have
- `<html lang="ko">` 설정
- 모든 UI 텍스트 한국어 번역
- Gemini 프롬프트에 한국어 응답 명시
- Pretendard 폰트 적용
- 메타데이터 한국어화 (title, description)

### Must NOT Have (Guardrails)
- i18n 라이브러리 설치 금지 (hardcoded 번역만)
- 번역 파일 생성 금지 (locales/*.json 등)
- 언어 전환기 추가 금지
- 변수명/함수명 한국어화 금지
- console.log/error 메시지 번역 금지
- API 응답 키 번역 금지 (error 키 등은 영어 유지)
- 주식 티커 번역 금지 (AAPL, NVDA 등)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (테스트 인프라 없음)
- **User wants tests**: Manual-only
- **Framework**: none

### Manual QA Procedures
각 TODO 완료 후 Playwright 브라우저 또는 터미널로 검증

---

## Task Flow

```
Task 0 (Pretendard 폰트)
    ↓
Task 1 (layout.tsx) → Task 2~7 (컴포넌트 번역) [병렬 가능]
    ↓
Task 8 (Gemini 프롬프트)
    ↓
Task 9 (AI 캐시 무효화)
    ↓
Task 10 (Git commit & push)
    ↓
Task 11 (Vercel 배포)
    ↓
Task 12 (최종 검증)
```

## Parallelization

| Group | Tasks | Reason |
|-------|-------|--------|
| A | 2, 3, 4, 5, 6, 7 | 독립적인 컴포넌트 파일들 |

| Task | Depends On | Reason |
|------|------------|--------|
| 1 | 0 | 폰트 설정 후 layout 수정 |
| 8 | 1-7 | UI 번역 완료 후 AI 프롬프트 |
| 9 | 8 | 프롬프트 변경 후 캐시 무효화 |
| 10 | 9 | 모든 변경 완료 후 커밋 |
| 11 | 10 | 커밋 후 배포 |
| 12 | 11 | 배포 후 검증 |

---

## TODOs

- [ ] 0. Pretendard 폰트 설치 및 설정

  **What to do**:
  - `npm install pretendard` 설치
  - `globals.css`에 Pretendard import 추가
  - CSS variable로 폰트 패밀리 설정

  **Must NOT do**:
  - Google Fonts CDN 사용 (npm 패키지 사용)
  - 기존 Geist 폰트 완전 제거 (영문용 유지 가능)

  **Parallelizable**: NO (첫 번째 작업)

  **References**:
  - `src/app/globals.css` - 전역 스타일 파일
  - `src/app/layout.tsx:5-13` - 현재 Geist 폰트 설정
  - Pretendard 공식: https://github.com/orioncactus/pretendard

  **Acceptance Criteria**:
  - [ ] `npm install pretendard` 실행 → package.json에 추가됨
  - [ ] globals.css에 `@import "pretendard/dist/web/static/pretendard.css"` 추가
  - [ ] 브라우저에서 한국어 텍스트가 Pretendard로 렌더링됨

  **Commit**: NO (groups with 1)

---

- [ ] 1. layout.tsx 한국어화 및 폰트 적용

  **What to do**:
  - `<html lang="en">` → `<html lang="ko">` 변경
  - metadata title: "인사이더 시그널 - AI 주식 인텔리전스"
  - metadata description: "내부자 거래, 뉴스, 주가 흐름을 AI로 분석합니다"
  - body className에 Pretendard 폰트 적용

  **Must NOT do**:
  - Geist 폰트 import 제거 (영문 fallback용 유지)

  **Parallelizable**: NO (depends on 0)

  **References**:
  - `src/app/layout.tsx` - 전체 파일
  - `src/app/globals.css` - 폰트 CSS

  **Acceptance Criteria**:
  - [ ] `<html lang="ko">` 확인
  - [ ] 브라우저 탭 제목: "인사이더 시그널 - AI 주식 인텔리전스"
  - [ ] `npm run build` 성공

  **Commit**: YES
  - Message: `feat(i18n): add Korean localization with Pretendard font`
  - Files: `package.json`, `globals.css`, `layout.tsx`
  - Pre-commit: `npm run build`

---

- [ ] 2. 홈페이지 (page.tsx) 한국어화

  **What to do**:
  번역 매핑:
  - "Market Intelligence" → "마켓 인텔리전스"
  - "Decode the Market with" → "내부자 시그널로"
  - "Insider Signals" → "시장을 읽다"
  - "Uncover correlations..." → "내부자 거래, 뉴스, 주가 흐름의 상관관계를 분석합니다. Gemini AI가 실시간으로 패턴을 찾아드립니다."
  - "Price Correlation" → "주가 상관관계"
  - "See exactly where insiders..." → "내부자가 언제 매수/매도했는지 차트에서 한눈에 확인하세요."
  - "News Integration" → "뉴스 통합"
  - "Link major headlines..." → "주요 헤드라인과 주가 변동, 내부자 거래의 연결고리를 파악하세요."
  - "AI Insights" → "AI 인사이트"
  - "Get instant analysis..." → "트랙 레코드와 향후 트렌드에 대한 즉각적인 분석을 받아보세요."

  **Must NOT do**:
  - 컴포넌트 구조 변경

  **Parallelizable**: YES (with 3, 4, 5, 6, 7)

  **References**:
  - `src/app/page.tsx` - 전체 파일 (65 lines)

  **Acceptance Criteria**:
  - [ ] Playwright: `http://localhost:3000` 접속
  - [ ] 모든 영어 텍스트가 한국어로 표시됨
  - [ ] 스크린샷 저장

  **Commit**: NO (groups with 7)

---

- [ ] 3. 종목 상세 페이지 (stock/[symbol]/page.tsx) 한국어화

  **What to do**:
  번역 매핑:
  - "Stock Analysis" → "종목 분석"
  - "Price Action & Signals" → "주가 흐름 & 시그널"
  - "Activity Timeline" → "활동 타임라인"
  - "AI Pattern Insights" → "AI 패턴 인사이트"

  **Must NOT do**:
  - 주식 티커(symbol) 번역
  - 데이터 fetching 로직 변경

  **Parallelizable**: YES (with 2, 4, 5, 6, 7)

  **References**:
  - `src/app/stock/[symbol]/page.tsx:93` - "Stock Analysis"
  - `src/app/stock/[symbol]/page.tsx:111` - "Price Action & Signals"
  - `src/app/stock/[symbol]/page.tsx:123` - "Activity Timeline"
  - `src/app/stock/[symbol]/page.tsx:130` - "AI Pattern Insights"

  **Acceptance Criteria**:
  - [ ] Playwright: `http://localhost:3000/stock/AAPL` 접속
  - [ ] 헤더에 "종목 분석" 표시
  - [ ] 섹션 제목들이 한국어로 표시

  **Commit**: NO (groups with 7)

---

- [ ] 4. SearchBar 컴포넌트 한국어화

  **What to do**:
  번역 매핑:
  - "Enter stock ticker (e.g. AAPL, NVDA)..." → "종목 코드 입력 (예: AAPL, NVDA)..."
  - "Analyze" → "분석"

  **Must NOT do**:
  - 검색 로직 변경
  - 자동완성 기능 변경

  **Parallelizable**: YES (with 2, 3, 5, 6, 7)

  **References**:
  - `src/components/SearchBar.tsx:96` - placeholder
  - `src/components/SearchBar.tsx:108` - "Analyze" 버튼

  **Acceptance Criteria**:
  - [ ] Playwright: 홈페이지 검색창 확인
  - [ ] placeholder가 한국어로 표시
  - [ ] 버튼 텍스트 "분석"

  **Commit**: NO (groups with 7)

---

- [ ] 5. TimelineChart 컴포넌트 한국어화

  **What to do**:
  번역 매핑:
  - "No price data available for {symbol}" → "{symbol}의 주가 데이터가 없습니다"
  - "Insider Trading" → "내부자 거래"
  - "Buy" → "매수"
  - "Sell" → "매도"

  **Must NOT do**:
  - 차트 라이브러리 설정 변경
  - 숫자 포맷 변경 (USD 유지)

  **Parallelizable**: YES (with 2, 3, 4, 6, 7)

  **References**:
  - `src/components/Timeline/TimelineChart.tsx:163-166` - 빈 데이터 메시지
  - `src/components/Timeline/TimelineChart.tsx:181` - "Insider Trading"
  - `src/components/Timeline/TimelineChart.tsx:184` - "Buy"
  - `src/components/Timeline/TimelineChart.tsx:188` - "Sell"

  **Acceptance Criteria**:
  - [ ] Playwright: 종목 페이지 차트 하단 확인
  - [ ] "내부자 거래", "매수", "매도" 레이블 표시

  **Commit**: NO (groups with 7)

---

- [ ] 6. ActivityTimeline 컴포넌트 한국어화

  **What to do**:
  번역 매핑:
  - "No recent activity detected for this symbol." → "이 종목의 최근 활동이 없습니다."
  - "Insider Buy" → "내부자 매수"
  - "Insider Sell" → "내부자 매도"
  - "News" → "뉴스"
  - "bought" → "매수"
  - "sold" → "매도"
  - "shares" → "주"
  - "Price:" → "가격:"
  - "Code:" → "코드:"

  **Must NOT do**:
  - 내부자 이름 번역 (영문 이름 유지)
  - 날짜 포맷 변경 (YYYY-MM-DD 유지)

  **Parallelizable**: YES (with 2, 3, 4, 5, 7)

  **References**:
  - `src/components/Timeline/ActivityTimeline.tsx:31-33` - 빈 상태 메시지
  - `src/components/Timeline/ActivityTimeline.tsx:49-51` - 태그 레이블
  - `src/components/Timeline/ActivityTimeline.tsx:63` - 거래 설명
  - `src/components/Timeline/ActivityTimeline.tsx:67-68` - 가격/코드

  **Acceptance Criteria**:
  - [ ] Playwright: 종목 페이지 Activity Timeline 확인
  - [ ] 태그가 "내부자 매수", "내부자 매도", "뉴스"로 표시
  - [ ] 거래 설명이 한국어로 표시

  **Commit**: NO (groups with 7)

---

- [ ] 7. InsightPanel 및 PeriodSelector 한국어화

  **What to do**:
  
  InsightPanel 번역:
  - "Gemini is analyzing market signals..." → "Gemini가 시장 시그널을 분석 중입니다..."
  - "Analysis Complete" → "분석 완료"
  - "AI-generated content may be inaccurate. Data is refreshed daily." → "AI 생성 콘텐츠는 부정확할 수 있습니다. 데이터는 매일 갱신됩니다."

  PeriodSelector 번역:
  - PERIODS 배열을 표시용 레이블 매핑 추가
  - '1M' → '1개월', '3M' → '3개월', '1Y' → '1년'
  - URL 파라미터는 영문 유지 (1M, 3M, 1Y)

  **Must NOT do**:
  - URL searchParams 값 변경 (영문 유지)

  **Parallelizable**: YES (with 2, 3, 4, 5, 6)

  **References**:
  - `src/components/InsightPanel.tsx:46` - 로딩 메시지
  - `src/components/InsightPanel.tsx:61` - 완료 메시지
  - `src/components/InsightPanel.tsx:69-70` - 면책 조항
  - `src/components/PeriodSelector.tsx:5` - PERIODS 배열
  - `src/components/PeriodSelector.tsx:33` - 버튼 텍스트

  **Acceptance Criteria**:
  - [ ] Playwright: 종목 페이지 AI 패널 로딩 상태 확인
  - [ ] "Gemini가 시장 시그널을 분석 중입니다..." 표시
  - [ ] 기간 버튼이 "1개월", "3개월", "1년"으로 표시
  - [ ] 기간 클릭 시 URL에 영문 파라미터 유지 (?period=1M)

  **Commit**: YES
  - Message: `feat(i18n): translate all UI components to Korean`
  - Files: `src/app/page.tsx`, `src/app/stock/[symbol]/page.tsx`, `src/components/SearchBar.tsx`, `src/components/Timeline/TimelineChart.tsx`, `src/components/Timeline/ActivityTimeline.tsx`, `src/components/InsightPanel.tsx`, `src/components/PeriodSelector.tsx`
  - Pre-commit: `npm run build`

---

- [ ] 8. Gemini AI 프롬프트 한국어화

  **What to do**:
  프롬프트 수정:
  ```
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
  ```

  **Must NOT do**:
  - Gemini API 설정 변경
  - 모델명 변경
  - JSON 데이터 구조 변경

  **Parallelizable**: NO (depends on 1-7)

  **References**:
  - `src/lib/api/gemini.ts:9-26` - 현재 영문 프롬프트

  **Acceptance Criteria**:
  - [ ] 종목 페이지 접속 후 AI 인사이트가 한국어로 생성됨
  - [ ] "주요 패턴", "실행 가능한 인사이트" 섹션이 한국어

  **Commit**: YES
  - Message: `feat(ai): update Gemini prompt for Korean responses`
  - Files: `src/lib/api/gemini.ts`
  - Pre-commit: `npm run build`

---

- [ ] 9. Supabase AI 캐시 무효화

  **What to do**:
  - Supabase `ai_insights` 테이블의 모든 레코드 삭제
  - 또는 TTL 만료된 것처럼 처리

  **Must NOT do**:
  - `api_cache` 테이블 삭제 (다른 캐시 데이터)
  - 테이블 스키마 변경

  **Parallelizable**: NO (depends on 8)

  **References**:
  - Supabase Dashboard: https://jerdsathwsqdnhzuycbo.supabase.co
  - `src/lib/cache/supabaseCache.ts` - 캐시 구조 참고

  **Acceptance Criteria**:
  - [ ] Supabase Dashboard에서 `ai_insights` 테이블 확인
  - [ ] 기존 영어 응답 레코드 삭제됨
  - [ ] 새 종목 조회 시 한국어 응답 생성됨

  **Commit**: NO (데이터베이스 작업)

---

- [ ] 10. Git commit & push

  **What to do**:
  - 모든 변경사항 확인
  - Git add, commit, push

  **Must NOT do**:
  - force push
  - 환경변수 파일 커밋

  **Parallelizable**: NO (depends on 9)

  **References**:
  - `.gitignore` - 커밋 제외 파일 확인

  **Acceptance Criteria**:
  - [ ] `git status` → clean working directory
  - [ ] `git log` → 커밋 확인
  - [ ] GitHub에서 변경사항 확인

  **Commit**: N/A (이 작업 자체가 커밋)

---

- [ ] 11. Vercel 재배포

  **What to do**:
  - `vercel --prod --yes` 실행
  - 또는 GitHub push로 자동 배포 대기

  **Must NOT do**:
  - 환경변수 변경
  - 빌드 설정 변경

  **Parallelizable**: NO (depends on 10)

  **References**:
  - Vercel Dashboard
  - 배포 URL: https://insider-signal-web.vercel.app

  **Acceptance Criteria**:
  - [ ] Vercel 빌드 성공
  - [ ] 배포 완료 메시지

  **Commit**: NO

---

- [ ] 12. 최종 검증

  **What to do**:
  - 프로덕션 사이트 전체 테스트
  - 모든 페이지 한국어 확인
  - AI 인사이트 한국어 확인

  **Must NOT do**:
  - 추가 코드 변경

  **Parallelizable**: NO (depends on 11)

  **References**:
  - https://insider-signal-web.vercel.app
  - https://insider-signal-web.vercel.app/stock/AAPL

  **Acceptance Criteria**:
  - [ ] Playwright: 프로덕션 홈페이지 → 모든 텍스트 한국어
  - [ ] Playwright: /stock/AAPL → 차트, 타임라인, AI 패널 한국어
  - [ ] AI 인사이트 "주요 패턴", "실행 가능한 인사이트" 한국어 확인
  - [ ] 스크린샷 저장: `.sisyphus/evidence/final-*.png`

  **Commit**: NO

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(i18n): add Korean localization with Pretendard font` | package.json, globals.css, layout.tsx | npm run build |
| 7 | `feat(i18n): translate all UI components to Korean` | 7 component files | npm run build |
| 8 | `feat(ai): update Gemini prompt for Korean responses` | gemini.ts | npm run build |

---

## Success Criteria

### Verification Commands
```bash
npm run build  # Expected: Compiled successfully
npm run dev    # Expected: Server starts on localhost:3000
```

### Final Checklist
- [ ] 모든 UI 텍스트가 한국어로 표시됨
- [ ] AI 인사이트가 한국어로 생성됨
- [ ] Pretendard 폰트가 적용됨
- [ ] `<html lang="ko">` 설정됨
- [ ] 메타데이터가 한국어로 설정됨
- [ ] Vercel 배포 성공
- [ ] 영어 텍스트가 남아있지 않음 (티커, 회사명 제외)
