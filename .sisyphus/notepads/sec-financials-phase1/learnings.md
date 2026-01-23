
# Task 6: 재무 차트 컴포넌트 구현

## 완료 일시
2026-01-23

## 구현 내용

### 1. FinancialsChart 컴포넌트
- **위치**: `src/components/FinancialsChart.tsx`
- **역할**: 분기별 재무 데이터(매출, 순이익, EPS, FCF) 시각화
- **기술 스택**: `lightweight-charts` 라이브러리 활용

### 2. 주요 특징
- **다중 시리즈 차트**: 
  - 매출/순이익: Histogram Series (막대)
  - EPS/FCF: Line Series (선)
  - 2개의 Y축 사용 (Left: EPS, Right: 매출/순이익/FCF)
- **기간 필터링**: 8Q/12Q/20Q 선택에 따라 최신 데이터부터 필터링
- **합성 날짜**: `lightweight-charts`의 날짜 필수 요구사항을 충족하기 위해 분기(Q) 정보를 대략적인 월말 날짜(YYYY-MM-DD)로 변환
- **커스텀 툴팁**: 4가지 재무 지표를 하나의 툴팁에 통합 표시
- **반응형**: 화면 크기 변경 시 차트 자동 리사이징

### 3. 기술적 결정 및 학습
- **Z-Order 처리**: 막대 그래프(Histogram)가 겹칠 경우를 대비하여 순이익(Net Income)을 매출(Revenue) 뒤에 렌더링하도록 순서 조정
- **데이터 전처리**: 
  - API 데이터는 최신순(내림차순)이지만, 차트는 시간 오름차순이 필요하므로 `reverse()` 처리
  - 분기별 데이터를 정렬하기 위한 키(`YYYY-Q`) 생성 로직 구현
- **빈 데이터 처리**: 데이터가 없거나 로딩 실패 시 "데이터가 없습니다" 메시지 표시

### 4. 주의사항
- **차트 높이**: 반응형 높이 적용 (모바일 300px, 데스크탑 400px)
- **메모리 누수 방지**: `useEffect` cleanup 함수에서 `chart.remove()` 및 ResizeObserver disconnect 필수

### 5. 개선 사항 (2026-01-23 업데이트)
- **ResizeObserver 적용**: `window.addEventListener('resize')` 대신 `ResizeObserver`를 사용하여 컨테이너 크기 변화를 더 정확하게 감지
- **반응형 높이**: CSS 클래스 `h-[300px] sm:h-[400px]`와 JS `getChartHeight()` 함수를 동기화하여 모바일/데스크탑 높이 차별화
- **Tailwind 브레이크포인트**: `sm:` (640px) 기준으로 모바일/데스크탑 구분
