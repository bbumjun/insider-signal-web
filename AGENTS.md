# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-23
**Commit:** 3b33f3f
**Branch:** main

## OVERVIEW

Insider Signal - AI stock intelligence web app analyzing insider trading, news, and price correlations. Next.js 16 App Router + TypeScript + Tailwind + Supabase.

## STRUCTURE

```
insider-signal-web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Home: search, watchlist, hot insider buys
│   │   ├── stock/[symbol]/     # Stock analysis page (SSR)
│   │   └── api/                # Route handlers
│   │       ├── search/         # Stock symbol search
│   │       ├── stock/[symbol]/ # AI analysis endpoint
│   │       ├── watchlist/      # User watchlist CRUD
│   │       ├── insider-screener/  # Hot insider buys aggregation
│   │       └── auth/           # NextAuth.js Google OAuth
│   ├── components/
│   │   ├── Timeline/           # Chart components (lightweight-charts)
│   │   └── *.tsx               # UI components
│   ├── lib/
│   │   ├── api/                # External API clients
│   │   │   ├── finnhub.ts      # Insider transactions, news
│   │   │   ├── gemini.ts       # AI analysis (Gemini 2.5 Flash)
│   │   │   └── alphaVantage.ts # Unused/backup
│   │   ├── cache/              # Supabase-backed caching
│   │   ├── supabase/           # Client/server Supabase helpers
│   │   └── auth.ts             # NextAuth.js config
│   └── types/                  # TypeScript interfaces
└── public/                     # Static assets
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Stock page SSR data | `src/app/stock/[symbol]/page.tsx` | Uses yahoo-finance2 + finnhub |
| AI prompt engineering | `src/lib/api/gemini.ts` | Option pattern detection logic |
| Chart rendering | `src/components/Timeline/TimelineChart.tsx` | lightweight-charts, markers |
| Caching strategy | `src/lib/cache/supabaseCache.ts` | TTL-based, permanent news accumulation |
| Auth flow | `src/lib/auth.ts` | NextAuth.js v5 beta with Google |
| Hot insider buys | `src/app/api/insider-screener/` | Aggregates open market purchases |

## CONVENTIONS

- **Korean development**: 코드 주석, 커밋 메시지, PR 설명 모두 한국어로 작성
- **Korean UI text**: App targets Korean market; keep UI strings in Korean
- **Commit & Deploy immediately**: 작업 완료 시 바로 커밋하고 배포 (git push)
- **Caching**: Supabase `api_cache` table with `cache_key`, `data`, `expires_at`
- **Transaction codes**: P=open market buy (strongest signal), M=option exercise, S=sell, A=award
- **Path alias**: `@/*` maps to `./src/*`
- **Font**: Pretendard (Korean), Geist fallback

## ANTI-PATTERNS (THIS PROJECT)

- **Never ignore open market buys (P)**: Most important signal, always highlight
- **Never treat all insider sells equally**: Most are routine; only flag cluster sells or >$10M
- **Avoid excessive API calls**: Finnhub has 60 calls/min limit; use cache aggressively
- **No tests**: Project has no test setup (jest/vitest absent)

## UNIQUE STYLES

- **Marker system on charts**:
  - Green circle: insider buy (A, M)
  - Yellow star: open market buy (P) - strongest signal
  - Red circle: insider sell
  - Blue circle: news event
- **AI analysis format**: Structured with `<!--SIGNAL:{"buy":N,"sell":N}-->` comment for parsing
- **News accumulation**: News cached permanently and merged incrementally (not overwritten)

## COMMANDS

```bash
# Development
bun dev          # or npm run dev (port 3000)

# Build
bun build        # or npm run build

# Lint
bun lint         # or npm run lint (eslint)
```

## ENV VARS

```
GEMINI_API_KEY          # Google Gemini AI
FINNHUB_API_KEY         # Insider transactions, news
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
GOOGLE_CLIENT_ID        # OAuth
GOOGLE_CLIENT_SECRET
AUTH_SECRET             # NextAuth.js
```

## NOTES

- **yahoo-finance2**: Used for stock price charts (1Y history); finnhub candles unused
- **Gemini model**: `gemini-2.5-flash` with 3 retries on 503/overload
- **Option pattern analysis**: Pre-processes transactions before AI prompt to detect hold-vs-sell patterns
- **Mobile responsive**: UI adapts; chart tooltips have touch support
- **No tests**: Prioritize manual verification; consider adding Playwright for critical paths
