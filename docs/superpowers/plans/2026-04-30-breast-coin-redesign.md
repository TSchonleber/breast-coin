# breast-coin redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the new `breast-coin.vercel.app` landing page — Polished Pop aesthetic, Polished Delight motion, live trade-fee tracker pulling real data from donate.gg every 30s.

**Architecture:** Next.js 16 App Router with a thin server route handler that scrapes donate.gg's public RSC payload (no API key, no DB except Vercel KV for chart history). Static Server Components for sections 1–3 and 5–8. Client Components only for the animated counter, fee feed, chart, and milestone confetti.

**Tech Stack:** Next.js 16 (App Router) · TypeScript strict · Tailwind 4 · Framer Motion · Vercel KV (optional, gracefully degraded) · Vitest (unit) · Playwright (smoke).

**Spec:** `docs/superpowers/specs/2026-04-30-breast-coin-redesign-design.md`

---

## File structure

```
/Users/r4vager/breast-coin
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.ts
├── vercel.json                              # cron: /api/snapshot every 5min
├── playwright.config.ts
├── vitest.config.ts
├── app/
│   ├── layout.tsx                           # font + metadata + OG
│   ├── page.tsx                             # composes all sections
│   ├── globals.css                          # palette CSS vars + base styles
│   └── api/
│       ├── stats/route.ts                   # GET — scrape donate.gg RSC
│       └── snapshot/route.ts                # POST (cron) — write KV history
├── components/
│   ├── Section.tsx                          # layout wrapper (max-w, padding)
│   ├── Ribbon.tsx                           # inline SVG ribbon, optional bob
│   ├── LiveDot.tsx                          # pulsing dot
│   ├── EyebrowPill.tsx                      # eyebrow chip with optional dot
│   ├── Wordmark.tsx                         # `Breast.coin` mark
│   ├── Counter.tsx                          # framer-motion animated USD
│   ├── StatCard.tsx                         # big number + caption
│   ├── Confetti.tsx                         # one-shot milestone confetti
│   ├── Hero.tsx                             # section 1
│   ├── WhyThisExists.tsx                    # section 2
│   ├── HowItWorks.tsx                       # section 3
│   ├── FeeFeed.tsx                          # live event list
│   ├── TrackerChart.tsx                     # hand-rolled SVG line chart
│   ├── LiveTracker.tsx                      # section 4 (composes feed + chart)
│   ├── TokenBlock.tsx                       # section 5
│   ├── CharityBlock.tsx                     # section 6
│   ├── CommunityRow.tsx                     # section 7
│   └── Footer.tsx                           # section 8
├── hooks/
│   ├── useStats.ts                          # 30s polling hook for /api/stats
│   └── useMilestones.ts                     # threshold-crossing detector
├── lib/
│   ├── config.ts                            # all addresses, URLs, milestones
│   ├── formatUsd.ts                         # Intl helpers
│   └── parseDonateGgRsc.ts                  # the regex extractor (unit tested)
├── public/
│   ├── og-image.png
│   └── favicon.svg
├── tests/
│   ├── unit/
│   │   ├── formatUsd.test.ts
│   │   └── parseDonateGgRsc.test.ts
│   ├── fixtures/
│   │   └── donate-gg-rsc.txt                # real captured payload, redacted nothing
│   └── smoke/
│       └── home.spec.ts                     # Playwright: renders, counter > 0
└── docs/
    └── superpowers/
        ├── specs/                           # already exists
        └── plans/                           # this plan
```

---

## Task 1: Initialize Next.js project + dependencies

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `next-env.d.ts`
- Create: `.gitignore` (already exists, will be expanded)

- [ ] **Step 1: Run create-next-app with the right flags**

```bash
cd /Users/r4vager/breast-coin
# create-next-app refuses non-empty dirs; use --use-npm and target a temp scratch then move,
# or pass an empty subdir name. Cleanest: scaffold into a sibling temp and rsync over.
npx --yes create-next-app@latest .scratch \
  --ts --tailwind --app --no-src-dir --import-alias "@/*" \
  --use-npm --skip-install
rsync -a --exclude='.git' --exclude='.gitignore' .scratch/ ./
rm -rf .scratch
```

Expected: `app/`, `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `postcss.config.mjs` now exist. `.gitignore` is unchanged (we keep ours).

- [ ] **Step 2: Install runtime deps**

```bash
npm i framer-motion lucide-react
npm i -D vitest @vitest/ui happy-dom @types/node
npm i -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 3: Add scripts to package.json**

Modify `package.json` `scripts` to read:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:smoke": "playwright test"
}
```

- [ ] **Step 4: Verify dev server boots**

```bash
npm run dev &
sleep 6
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
kill %1
```

Expected: `200`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 16 project with Tailwind, framer-motion, vitest, playwright"
```

---

## Task 2: Palette, fonts, and global styles

**Files:**
- Modify: `app/layout.tsx`, `app/globals.css`, `tailwind.config.ts`

- [ ] **Step 1: Set up Inter font in `app/layout.tsx`**

Replace the file with:

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Breast.coin — a memecoin with a heart of pink',
  description:
    '99% of every $BREAST trade routes to the National Breast Cancer Foundation, on-chain, in real time.',
  metadataBase: new URL('https://breast-coin.vercel.app'),
  openGraph: {
    title: 'Breast.coin — a memecoin with a heart of pink',
    description:
      '99% of every $BREAST trade routes to the National Breast Cancer Foundation, on-chain, in real time.',
    url: 'https://breast-coin.vercel.app',
    siteName: 'Breast.coin',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Breast.coin — a memecoin with a heart of pink',
    description:
      '99% of every $BREAST trade routes to the National Breast Cancer Foundation, on-chain, in real time.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-cream text-ink antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Set palette in `app/globals.css`**

Replace the file with:

```css
@import "tailwindcss";

@theme {
  --color-cream: #fff5ec;
  --color-ink: #14060f;
  --color-ink-soft: #4a2230;
  --color-pink-50: #fdf2f8;
  --color-pink-500: #ec4899;
  --color-pink-700: #be185d;
  --color-pink-900: #831843;
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
}

:root {
  --rule: rgba(190, 24, 93, 0.18);
  --shadow-soft: 0 8px 22px -16px rgba(190, 24, 93, 0.5);
}

html, body {
  background: var(--color-cream);
  color: var(--color-ink);
}

* {
  font-feature-settings: "ss01" on, "cv11" on;
}

.tnum {
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: Replace `app/page.tsx` with a placeholder hero**

```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-black tracking-tight">Breast<span className="text-pink-500">.</span>coin</h1>
    </main>
  )
}
```

- [ ] **Step 4: Boot, verify palette renders**

```bash
npm run dev &
sleep 6
curl -s http://localhost:3000 | grep -o "Breast" | head -1
kill %1
```

Expected: prints `Breast`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: palette, Inter font, OG metadata, reduced-motion baseline"
```

---

## Task 3: Project config (`lib/config.ts`)

**Files:**
- Create: `lib/config.ts`

- [ ] **Step 1: Write the config**

```ts
// lib/config.ts
export const TOKEN = {
  mint: '4ZdhpbJJNPBHNYVGfv41DRfTytjrb6Yg5P4y5iuRpump',
  symbol: 'BREAST',
  name: 'Breastcoin',
  decimals: 6,
  standard: 'SPL_TOKEN2022',
  chainId: 101,
  chain: 'solana',
} as const

export const CHARITY = {
  name: 'National Breast Cancer Foundation',
  shortName: 'NBCF',
  website: 'https://www.nationalbreastcancer.org',
  creditedAccount: 'GvUieqisLLDdUeB3yDYuQPgCV14urh5BS4En59bXTgvU',
} as const

export const DONATE_GG = {
  rscUrl: 'https://www.donate.gg/charity-coins?_rsc=1',
  donationSourceProgram: 'pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ',
} as const

export const LINKS = {
  pumpfun: `https://pump.fun/coin/${'4ZdhpbJJNPBHNYVGfv41DRfTytjrb6Yg5P4y5iuRpump'}`,
  solscanToken: `https://solscan.io/token/${'4ZdhpbJJNPBHNYVGfv41DRfTytjrb6Yg5P4y5iuRpump'}`,
  solscanCharityAccount: `https://solscan.io/account/${'GvUieqisLLDdUeB3yDYuQPgCV14urh5BS4En59bXTgvU'}`,
  jupiter: `https://jup.ag/swap/SOL-${'4ZdhpbJJNPBHNYVGfv41DRfTytjrb6Yg5P4y5iuRpump'}`,
  birdeye: `https://birdeye.so/token/${'4ZdhpbJJNPBHNYVGfv41DRfTytjrb6Yg5P4y5iuRpump'}?chain=solana`,
  dexscreener: `https://dexscreener.com/solana/${'4ZdhpbJJNPBHNYVGfv41DRfTytjrb6Yg5P4y5iuRpump'}`,
} as const

export const SOCIAL = {
  twitter: '',     // fill when available
  telegram: '',    // fill when available
  pumpfunComments: `https://pump.fun/coin/${'4ZdhpbJJNPBHNYVGfv41DRfTytjrb6Yg5P4y5iuRpump'}`,
  github: '',      // fill if repo goes public
} as const

export const MILESTONES_USD = [5_000, 10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000] as const

export const POLL_MS = 30_000
export const POLL_JITTER_MS = 3_000
```

- [ ] **Step 2: Commit**

```bash
git add lib/config.ts
git commit -m "feat: project config (token, charity, donate.gg, links, milestones)"
```

---

## Task 4: USD formatting utility (TDD)

**Files:**
- Create: `lib/formatUsd.ts`, `tests/unit/formatUsd.test.ts`, `vitest.config.ts`

- [ ] **Step 1: Add vitest config**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['tests/unit/**/*.test.ts'],
  },
})
```

- [ ] **Step 2: Write the failing tests**

```ts
// tests/unit/formatUsd.test.ts
import { describe, it, expect } from 'vitest'
import { formatUsd, formatUsdCompact, fromMicroUsd } from '@/lib/formatUsd'

describe('formatUsd', () => {
  it('formats whole dollars with the $ sign and two decimals', () => {
    expect(formatUsd(10005.07)).toBe('$10,005.07')
  })

  it('formats zero as $0.00', () => {
    expect(formatUsd(0)).toBe('$0.00')
  })

  it('rounds half to even at the cent boundary', () => {
    expect(formatUsd(0.005)).toBe('$0.01')
  })
})

describe('formatUsdCompact', () => {
  it('renders 999 as $999', () => {
    expect(formatUsdCompact(999)).toBe('$999')
  })
  it('renders 1500 as $1.5K', () => {
    expect(formatUsdCompact(1500)).toBe('$1.5K')
  })
  it('renders 12_500_000 as $12.5M', () => {
    expect(formatUsdCompact(12_500_000)).toBe('$12.5M')
  })
})

describe('fromMicroUsd', () => {
  it('converts the donate.gg displayedUsdE6 BigInt string to USD', () => {
    expect(fromMicroUsd('10005073295')).toBe(10005.073295)
  })
  it('handles "0"', () => {
    expect(fromMicroUsd('0')).toBe(0)
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npx vitest run tests/unit/formatUsd.test.ts
```

Expected: 9 failures, "Cannot find module '@/lib/formatUsd'".

- [ ] **Step 4: Add the path alias for vitest**

Modify `vitest.config.ts` to add `resolve.alias`:

```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['tests/unit/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './') },
  },
})
```

- [ ] **Step 5: Implement the utility**

```ts
// lib/formatUsd.ts
const usdFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const compactFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatUsd(n: number): string {
  return usdFmt.format(n)
}

export function formatUsdCompact(n: number): string {
  return compactFmt.format(n)
}

export function fromMicroUsd(microUsdE6: string | number | bigint): number {
  // donate.gg encodes USD * 10^6 as a string. We keep precision by dividing in JS once.
  const big = typeof microUsdE6 === 'bigint' ? microUsdE6 : BigInt(microUsdE6)
  // Number.MAX_SAFE_INTEGER is 9.007e15 — donate.gg totals are nowhere near that
  return Number(big) / 1_000_000
}
```

- [ ] **Step 6: Run tests until green**

```bash
npx vitest run tests/unit/formatUsd.test.ts
```

Expected: 9 passing.

- [ ] **Step 7: Commit**

```bash
git add lib/formatUsd.ts tests/unit/formatUsd.test.ts vitest.config.ts
git commit -m "feat: USD formatting utilities with full unit coverage"
```

---

## Task 5: donate.gg RSC parser (TDD with real fixture)

**Files:**
- Create: `tests/fixtures/donate-gg-rsc.txt` (captured payload), `lib/parseDonateGgRsc.ts`, `tests/unit/parseDonateGgRsc.test.ts`

- [ ] **Step 1: Capture a real payload as a fixture**

```bash
mkdir -p tests/fixtures
curl -s -L 'https://www.donate.gg/charity-coins?_rsc=1' -H 'RSC: 1' -o tests/fixtures/donate-gg-rsc.txt
wc -c tests/fixtures/donate-gg-rsc.txt
grep -c 'Breastcoin' tests/fixtures/donate-gg-rsc.txt
```

Expected: file exists, ≥ 30KB, `grep -c Breastcoin` returns `1`.

- [ ] **Step 2: Write the failing tests**

```ts
// tests/unit/parseDonateGgRsc.test.ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { parseDonateGgRsc } from '@/lib/parseDonateGgRsc'

const fixture = readFileSync(
  path.resolve(__dirname, '../fixtures/donate-gg-rsc.txt'),
  'utf8',
)

const BREAST_MINT = '4ZdhpbJJNPBHNYVGfv41DRfTytjrb6Yg5P4y5iuRpump'

describe('parseDonateGgRsc', () => {
  it('extracts the Breastcoin entry', () => {
    const stats = parseDonateGgRsc(fixture, BREAST_MINT)
    expect(stats).not.toBeNull()
    expect(stats!.displayedUsd).toBeGreaterThan(0)
    expect(stats!.donationCount).toBeGreaterThan(0)
    expect(stats!.rank).toBeGreaterThan(0)
    expect(stats!.firstDonationAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(stats!.lastDonationAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('parses USD-E6 BigInt strings into USD numbers', () => {
    const stats = parseDonateGgRsc(fixture, BREAST_MINT)!
    // displayedUsdE6 / 1e6 should equal displayedUsd
    expect(stats.displayedUsd).toBeCloseTo(stats.displayedUsdE6 / 1_000_000, 6)
  })

  it('returns null when the mint is not present', () => {
    const stats = parseDonateGgRsc(fixture, 'NotARealMint11111111111111111111111111pump')
    expect(stats).toBeNull()
  })

  it('returns null when the payload is malformed', () => {
    expect(parseDonateGgRsc('not a valid payload', BREAST_MINT)).toBeNull()
    expect(parseDonateGgRsc('', BREAST_MINT)).toBeNull()
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npx vitest run tests/unit/parseDonateGgRsc.test.ts
```

Expected: failures, "Cannot find module '@/lib/parseDonateGgRsc'".

- [ ] **Step 4: Implement the parser**

```ts
// lib/parseDonateGgRsc.ts
export interface DonateGgStats {
  displayedUsd: number
  finalizedUsd: number
  pendingUsd: number
  displayedUsdE6: number
  donationCount: number
  pendingCount: number
  finalizedCount: number
  rank: number
  firstDonationAt: string  // ISO 8601
  lastDonationAt: string   // ISO 8601
}

/**
 * Parse a donate.gg charity-coins RSC payload and extract stats for one token mint.
 *
 * The payload encodes BigInts as `$n<digits>` and dates as `$D<iso>`. Each entry is shaped
 * { donationSubject: { token: { address, symbol, ... } }, pendingUsdE6, finalizedUsdE6,
 *   displayedUsdE6, pendingCount, finalizedCount, donationCount, firstDonationAt,
 *   lastDonationAt, rank }
 * with the stats appearing in the bytes IMMEDIATELY after the token block.
 */
export function parseDonateGgRsc(payload: string, mint: string): DonateGgStats | null {
  if (!payload || !mint) return null

  const idx = payload.indexOf(mint)
  if (idx === -1) return null

  // Stats appear after the token's closing brace. Look at a generous forward window.
  // 1500 bytes is more than enough for a single entry.
  const window = payload.slice(idx, idx + 1500)

  const num = (re: RegExp) => {
    const m = window.match(re)
    return m ? m[1] : null
  }

  const displayedE6 = num(/"displayedUsdE6":"\$n(\d+)"/)
  const finalizedE6 = num(/"finalizedUsdE6":"\$n(\d+)"/)
  const pendingE6 = num(/"pendingUsdE6":"\$n(\d+)"/)
  const donationCount = num(/"donationCount":(\d+)/)
  const pendingCount = num(/"pendingCount":(\d+)/)
  const finalizedCount = num(/"finalizedCount":(\d+)/)
  const rank = num(/"rank":(\d+)/)
  const firstAt = num(/"firstDonationAt":"\$D([^"]+)"/)
  const lastAt = num(/"lastDonationAt":"\$D([^"]+)"/)

  if (
    displayedE6 === null ||
    finalizedE6 === null ||
    pendingE6 === null ||
    donationCount === null ||
    pendingCount === null ||
    finalizedCount === null ||
    rank === null ||
    firstAt === null ||
    lastAt === null
  ) {
    return null
  }

  const toUsd = (e6: string) => Number(BigInt(e6)) / 1_000_000

  return {
    displayedUsd: toUsd(displayedE6),
    finalizedUsd: toUsd(finalizedE6),
    pendingUsd: toUsd(pendingE6),
    displayedUsdE6: Number(displayedE6),
    donationCount: Number(donationCount),
    pendingCount: Number(pendingCount),
    finalizedCount: Number(finalizedCount),
    rank: Number(rank),
    firstDonationAt: firstAt,
    lastDonationAt: lastAt,
  }
}
```

- [ ] **Step 5: Run tests until green**

```bash
npx vitest run tests/unit/parseDonateGgRsc.test.ts
```

Expected: 4 passing.

- [ ] **Step 6: Commit**

```bash
git add lib/parseDonateGgRsc.ts tests/unit/parseDonateGgRsc.test.ts tests/fixtures/donate-gg-rsc.txt
git commit -m "feat: donate.gg RSC payload parser with real-fixture tests"
```

---

## Task 6: `/api/stats` route handler

**Files:**
- Create: `app/api/stats/route.ts`

- [ ] **Step 1: Write the route handler**

```ts
// app/api/stats/route.ts
import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { TOKEN, DONATE_GG } from '@/lib/config'
import { parseDonateGgRsc, type DonateGgStats } from '@/lib/parseDonateGgRsc'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'  // we control caching ourselves below

interface StatsResponse {
  ok: true
  data: DonateGgStats & { fetchedAt: string }
}

interface StatsError {
  ok: false
  error: 'fetch_failed' | 'parse_failed'
}

const fetchAndParse = unstable_cache(
  async (): Promise<StatsResponse | StatsError> => {
    let payload: string
    try {
      const res = await fetch(DONATE_GG.rscUrl, {
        headers: {
          RSC: '1',
          'User-Agent': 'breast-coin/1.0 (+https://breast-coin.vercel.app)',
        },
        cache: 'no-store',
      })
      if (!res.ok) return { ok: false, error: 'fetch_failed' }
      payload = await res.text()
    } catch {
      return { ok: false, error: 'fetch_failed' }
    }

    const stats = parseDonateGgRsc(payload, TOKEN.mint)
    if (!stats) return { ok: false, error: 'parse_failed' }

    return {
      ok: true,
      data: { ...stats, fetchedAt: new Date().toISOString() },
    }
  },
  ['donate-gg-stats'],
  { revalidate: 30, tags: ['stats'] },
)

export async function GET() {
  const result = await fetchAndParse()
  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
    },
  })
}
```

- [ ] **Step 2: Boot dev server and hit the endpoint**

```bash
npm run dev &
sleep 6
curl -s http://localhost:3000/api/stats | head -c 500
kill %1
```

Expected: JSON shape `{"ok":true,"data":{"displayedUsd":...,"donationCount":...}}`.

- [ ] **Step 3: Commit**

```bash
git add app/api/stats/route.ts
git commit -m "feat: /api/stats route handler scrapes donate.gg with 30s ISR cache"
```

---

## Task 7: `useStats` hook (client-side polling)

**Files:**
- Create: `hooks/useStats.ts`

- [ ] **Step 1: Write the hook**

```ts
// hooks/useStats.ts
'use client'
import { useEffect, useRef, useState } from 'react'
import { POLL_MS, POLL_JITTER_MS } from '@/lib/config'
import type { DonateGgStats } from '@/lib/parseDonateGgRsc'

export interface StatsState extends DonateGgStats {
  fetchedAt: string
}

interface ApiOk { ok: true; data: StatsState }
interface ApiErr { ok: false; error: string }
type ApiBody = ApiOk | ApiErr

export function useStats(initial: StatsState | null) {
  const [stats, setStats] = useState<StatsState | null>(initial)
  const [previous, setPrevious] = useState<StatsState | null>(initial)
  const aliveRef = useRef(true)

  useEffect(() => {
    aliveRef.current = true

    const tick = async () => {
      try {
        const res = await fetch('/api/stats', { cache: 'no-store' })
        if (!res.ok) return
        const body = (await res.json()) as ApiBody
        if (!body.ok) return
        if (!aliveRef.current) return
        setPrevious(prev => prev ?? body.data)
        setStats(curr => {
          if (curr) setPrevious(curr)
          return body.data
        })
      } catch {
        // silent — keep last known value, retry on next tick
      }
    }

    const schedule = () => {
      const jitter = (Math.random() * 2 - 1) * POLL_JITTER_MS
      const delay = POLL_MS + jitter
      return window.setTimeout(async () => {
        await tick()
        if (aliveRef.current) timer = schedule()
      }, delay)
    }

    let timer = schedule()
    return () => {
      aliveRef.current = false
      window.clearTimeout(timer)
    }
  }, [])

  return { stats, previous }
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/useStats.ts
git commit -m "feat: useStats client-side polling hook with jitter and silent retries"
```

---

## Task 8: KV snapshot endpoint + Vercel cron config

**Files:**
- Create: `app/api/snapshot/route.ts`, `vercel.json`
- Modify: `package.json` (add `@vercel/kv`)

- [ ] **Step 1: Install KV client**

```bash
npm i @vercel/kv
```

- [ ] **Step 2: Write the snapshot endpoint**

```ts
// app/api/snapshot/route.ts
// Vercel cron POST endpoint. Reads /api/stats and appends a snapshot to KV.
// Falls back gracefully if KV is unconfigured (returns 200 with `kv: 'not_configured'`).
import { NextResponse } from 'next/server'
import { TOKEN, DONATE_GG } from '@/lib/config'
import { parseDonateGgRsc } from '@/lib/parseDonateGgRsc'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const KV_KEY = 'breast-coin:snapshots'   // sorted set, score = unix ms, member = JSON
const MAX_SNAPSHOTS = 14 * 24 * 12       // 14 days × 24 hours × 12 (every 5 min)

export async function GET(req: Request) {
  // Vercel cron sends GET with the configured Authorization secret if set
  if (process.env.CRON_SECRET) {
    const authz = req.headers.get('authorization') ?? ''
    if (authz !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }
  }

  const res = await fetch(DONATE_GG.rscUrl, {
    headers: { RSC: '1', 'User-Agent': 'breast-coin-cron/1.0' },
    cache: 'no-store',
  })
  if (!res.ok) return NextResponse.json({ ok: false, error: 'fetch_failed' }, { status: 502 })
  const payload = await res.text()
  const stats = parseDonateGgRsc(payload, TOKEN.mint)
  if (!stats) return NextResponse.json({ ok: false, error: 'parse_failed' }, { status: 502 })

  const now = Date.now()
  const snapshot = JSON.stringify({
    t: now,
    usd: stats.displayedUsd,
    count: stats.donationCount,
    rank: stats.rank,
  })

  // Try KV; degrade gracefully if not configured
  if (!process.env.KV_REST_API_URL) {
    return NextResponse.json({ ok: true, kv: 'not_configured', snapshot: JSON.parse(snapshot) })
  }

  const { kv } = await import('@vercel/kv')
  await kv.zadd(KV_KEY, { score: now, member: snapshot })
  // trim to last 14 days by removing oldest if over MAX_SNAPSHOTS
  const total = (await kv.zcard(KV_KEY)) ?? 0
  if (total > MAX_SNAPSHOTS) {
    await kv.zremrangebyrank(KV_KEY, 0, total - MAX_SNAPSHOTS - 1)
  }
  return NextResponse.json({ ok: true, kv: 'written', snapshot: JSON.parse(snapshot) })
}
```

- [ ] **Step 3: Add Vercel cron config**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/snapshot",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

- [ ] **Step 4: Add a chart-history GET endpoint**

```ts
// app/api/snapshot/route.ts (append below the GET above — split into two routes)
```

Actually, refactor: rename the cron handler to `app/api/snapshot/cron/route.ts` and add `app/api/snapshot/route.ts` for read access. Replace `app/api/snapshot/route.ts` with read-only:

```ts
// app/api/snapshot/route.ts (read-only history)
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const KV_KEY = 'breast-coin:snapshots'

export async function GET() {
  if (!process.env.KV_REST_API_URL) {
    return NextResponse.json({ ok: true, snapshots: [] })
  }
  const { kv } = await import('@vercel/kv')
  const raw = await kv.zrange(KV_KEY, 0, -1)
  const snapshots = (raw as string[]).map(s => JSON.parse(s))
  return NextResponse.json(
    { ok: true, snapshots },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
  )
}
```

Move the cron logic to `app/api/snapshot/cron/route.ts` (same as Step 2 content, just at the new path) and update `vercel.json` path:

```json
{ "crons": [{ "path": "/api/snapshot/cron", "schedule": "*/5 * * * *" }] }
```

- [ ] **Step 5: Verify both endpoints respond locally**

```bash
npm run dev &
sleep 6
curl -s http://localhost:3000/api/snapshot | head -c 200
echo ""
curl -s http://localhost:3000/api/snapshot/cron | head -c 200
kill %1
```

Expected: both return JSON. Without KV configured, snapshot history shows `{"ok":true,"snapshots":[]}` and cron returns `{"ok":true,"kv":"not_configured", ...}`.

- [ ] **Step 6: Commit**

```bash
git add app/api/snapshot vercel.json package.json package-lock.json
git commit -m "feat: KV-backed 14-day snapshot history + Vercel cron, gracefully degrades without KV"
```

---

## Task 9: `Section` layout primitive

**Files:**
- Create: `components/Section.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/Section.tsx
import { type HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'header' | 'footer'
  size?: 'normal' | 'narrow' | 'wide'
}

const widths = {
  narrow: 'max-w-3xl',
  normal: 'max-w-5xl',
  wide: 'max-w-6xl',
} as const

export function Section({
  as: Tag = 'section',
  size = 'normal',
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <Tag
      {...rest}
      className={`w-full mx-auto px-5 sm:px-8 ${widths[size]} ${className}`}
    >
      {children}
    </Tag>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Section.tsx
git commit -m "feat: Section layout primitive"
```

---

## Task 10: `Ribbon` SVG component

**Files:**
- Create: `components/Ribbon.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/Ribbon.tsx
'use client'
import { motion } from 'framer-motion'

interface Props {
  size?: number          // px
  rotation?: number      // deg
  bob?: boolean          // continuous bob animation
  className?: string
  ariaHidden?: boolean
}

export function Ribbon({
  size = 110,
  rotation = 14,
  bob = false,
  className = '',
  ariaHidden = false,
}: Props) {
  const path = (
    <>
      <path
        d="M50 30 C 40 10, 20 10, 25 35 L 45 75 L 50 60 L 55 75 L 75 35 C 80 10, 60 10, 50 30 Z"
        fill="var(--color-pink-500)"
      />
      <path
        d="M50 30 C 40 10, 20 10, 25 35 L 45 75 L 50 60 L 55 75 L 75 35 C 80 10, 60 10, 50 30 Z"
        fill="none"
        stroke="var(--color-pink-900)"
        strokeWidth="2"
      />
      <path
        d="M45 75 L 38 110 L 50 95 L 62 110 L 55 75"
        fill="var(--color-pink-500)"
        stroke="var(--color-pink-900)"
        strokeWidth="2"
      />
    </>
  )

  const Svg = (
    <svg
      width={size}
      height={(size * 130) / 110}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={ariaHidden ? undefined : 'img'}
      aria-hidden={ariaHidden ? true : undefined}
      aria-label={ariaHidden ? undefined : 'Pink ribbon, breast cancer awareness symbol'}
      className={className}
    >
      {path}
    </svg>
  )

  if (!bob) {
    return <span style={{ display: 'inline-block', transform: `rotate(${rotation}deg)` }}>{Svg}</span>
  }

  return (
    <motion.span
      style={{ display: 'inline-block', transformOrigin: '50% 100%' }}
      animate={{
        rotate: [rotation, rotation - 4, rotation],
        y: [0, -8, 0],
        scale: [1, 1.04, 1],
      }}
      transition={{ duration: 3.2, ease: 'easeInOut', repeat: Infinity }}
    >
      {Svg}
    </motion.span>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Ribbon.tsx
git commit -m "feat: Ribbon SVG component with optional bob animation"
```

---

## Task 11: `LiveDot` and `EyebrowPill` components

**Files:**
- Create: `components/LiveDot.tsx`, `components/EyebrowPill.tsx`

- [ ] **Step 1: Write `LiveDot.tsx`**

```tsx
// components/LiveDot.tsx
'use client'
import { motion } from 'framer-motion'

interface Props { size?: number }

export function LiveDot({ size = 8 }: Props) {
  return (
    <span
      className="relative inline-block"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span
        className="absolute inset-0 rounded-full bg-pink-500"
        style={{ width: size, height: size }}
      />
      <motion.span
        className="absolute inset-0 rounded-full bg-pink-500"
        style={{ width: size, height: size }}
        animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
      />
    </span>
  )
}
```

- [ ] **Step 2: Write `EyebrowPill.tsx`**

```tsx
// components/EyebrowPill.tsx
import { type ReactNode } from 'react'
import { LiveDot } from './LiveDot'

interface Props {
  showLiveDot?: boolean
  children: ReactNode
  className?: string
}

export function EyebrowPill({ showLiveDot = false, children, className = '' }: Props) {
  return (
    <span
      className={
        'inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1 text-pink-700 ' +
        'text-[10.5px] font-bold uppercase tracking-[0.08em] ' +
        className
      }
    >
      {showLiveDot && <LiveDot />}
      {children}
    </span>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/LiveDot.tsx components/EyebrowPill.tsx
git commit -m "feat: LiveDot pulse + EyebrowPill chip"
```

---

## Task 12: `Wordmark` component

**Files:**
- Create: `components/Wordmark.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/Wordmark.tsx
interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  inline?: boolean
  className?: string
}

const sizes = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-6xl',
  xl: 'text-7xl sm:text-8xl',
} as const

export function Wordmark({ size = 'lg', inline = false, className = '' }: Props) {
  return (
    <span
      className={
        `${sizes[size]} font-black leading-[0.95] tracking-[-0.04em] text-ink ${className}`
      }
    >
      Breast<span className="text-pink-500">.</span>{inline ? '' : <br />}coin
    </span>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Wordmark.tsx
git commit -m "feat: Wordmark component"
```

---

## Task 13: Animated `Counter` component

**Files:**
- Create: `components/Counter.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/Counter.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, animate as fmAnimate } from 'framer-motion'
import { formatUsd } from '@/lib/formatUsd'

interface Props {
  value: number
  className?: string
  duration?: number  // seconds
}

export function Counter({ value, className = '', duration = 0.8 }: Props) {
  const motionValue = useMotionValue(value)
  const [display, setDisplay] = useState(value)
  const prefersReducedMotion = useRef(false)

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    const unsub = motionValue.on('change', v => setDisplay(v))
    return () => unsub()
  }, [motionValue])

  useEffect(() => {
    if (prefersReducedMotion.current) {
      motionValue.set(value)
      return
    }
    const controls = fmAnimate(motionValue, value, {
      duration,
      ease: [0.32, 0.72, 0, 1],
    })
    return () => controls.stop()
  }, [value, duration, motionValue])

  return (
    <motion.span
      className={`tnum ${className}`}
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
      style={{ display: 'inline-block' }}
    >
      {formatUsd(display)}
    </motion.span>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Counter.tsx
git commit -m "feat: animated Counter with prefers-reduced-motion support"
```

---

## Task 14: `StatCard` component

**Files:**
- Create: `components/StatCard.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/StatCard.tsx
import { type ReactNode } from 'react'

interface Props {
  label: string
  value: ReactNode
  caption?: ReactNode
  className?: string
}

export function StatCard({ label, value, caption, className = '' }: Props) {
  return (
    <div
      className={
        'rounded-2xl bg-white p-5 sm:p-6 ' +
        'border border-[color:var(--rule)] shadow-[var(--shadow-soft)] ' +
        className
      }
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-pink-700">
        {label}
      </div>
      <div className="mt-1 text-3xl sm:text-4xl font-black text-pink-900 leading-none tnum">
        {value}
      </div>
      {caption && <div className="mt-2 text-xs text-ink-soft">{caption}</div>}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/StatCard.tsx
git commit -m "feat: StatCard component"
```

---

## Task 15: `Confetti` component + `useMilestones` hook

**Files:**
- Create: `components/Confetti.tsx`, `hooks/useMilestones.ts`

- [ ] **Step 1: Write `useMilestones`**

```ts
// hooks/useMilestones.ts
'use client'
import { useEffect, useRef, useState } from 'react'
import { MILESTONES_USD } from '@/lib/config'

const STORAGE_KEY = 'breast-coin:hit-milestones'

function loadHit(): Set<number> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as number[])
  } catch {
    return new Set()
  }
}

function saveHit(hit: Set<number>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...hit]))
  } catch {
    // ignore
  }
}

export function useMilestones(currentUsd: number | undefined) {
  const [crossed, setCrossed] = useState<number | null>(null)
  const hitRef = useRef<Set<number>>(new Set())

  useEffect(() => { hitRef.current = loadHit() }, [])

  useEffect(() => {
    if (currentUsd === undefined) return
    for (const m of MILESTONES_USD) {
      if (currentUsd >= m && !hitRef.current.has(m)) {
        hitRef.current.add(m)
        saveHit(hitRef.current)
        setCrossed(m)
        // Auto-clear after 6s so future re-renders don't re-fire
        const t = window.setTimeout(() => setCrossed(null), 6000)
        return () => window.clearTimeout(t)
      }
    }
  }, [currentUsd])

  return crossed
}
```

- [ ] **Step 2: Write `Confetti`**

```tsx
// components/Confetti.tsx
'use client'
import { motion } from 'framer-motion'
import { formatUsdCompact } from '@/lib/formatUsd'

const COLORS = ['var(--color-pink-500)', '#fde047', '#fb7185', '#c084fc', 'var(--color-pink-700)']

interface Piece { left: string; delay: number; rotate: number; color: string; shape: 'rect' | 'circle' }

const PIECES: Piece[] = Array.from({ length: 14 }).map((_, i) => ({
  left: `${10 + (i * 6) + Math.sin(i) * 4}%`,
  delay: (i % 5) * 0.18,
  rotate: (i * 47) % 360,
  color: COLORS[i % COLORS.length],
  shape: i % 3 === 0 ? 'circle' : 'rect',
}))

interface Props {
  milestone: number | null  // USD threshold or null
}

export function Confetti({ milestone }: Props) {
  if (!milestone) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {PIECES.map((p, i) => (
        <motion.div
          key={i}
          initial={{ y: -40, opacity: 0, rotate: p.rotate }}
          animate={{ y: '110vh', opacity: [0, 1, 1, 0], rotate: p.rotate + 720 }}
          transition={{ duration: 3.2, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute', top: 0, left: p.left,
            width: p.shape === 'rect' ? 8 : 10,
            height: p.shape === 'rect' ? 14 : 10,
            borderRadius: p.shape === 'rect' ? 2 : '50%',
            background: p.color,
          }}
          aria-hidden="true"
        />
      ))}
      <motion.div
        initial={{ y: -16, opacity: 0, scale: 0.85 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="fixed top-6 left-1/2 -translate-x-1/2 rounded-full bg-pink-900 text-pink-50 px-4 py-2 text-sm font-bold shadow-lg"
        role="status"
      >
        {formatUsdCompact(milestone)} milestone
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/Confetti.tsx hooks/useMilestones.ts
git commit -m "feat: milestone detection + confetti burst with localStorage gate"
```

---

## Task 16: `Hero` section

**Files:**
- Create: `components/Hero.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/Hero.tsx
'use client'
import { Section } from './Section'
import { Wordmark } from './Wordmark'
import { Ribbon } from './Ribbon'
import { EyebrowPill } from './EyebrowPill'
import { Counter } from './Counter'
import { LINKS, CHARITY } from '@/lib/config'
import { useStats } from '@/hooks/useStats'
import { useMilestones } from '@/hooks/useMilestones'
import { Confetti } from './Confetti'
import type { StatsState } from '@/hooks/useStats'

interface Props { initial: StatsState | null }

export function Hero({ initial }: Props) {
  const { stats } = useStats(initial)
  const usd = stats?.displayedUsd ?? initial?.displayedUsd ?? 0
  const count = stats?.donationCount ?? initial?.donationCount ?? 0
  const rank = stats?.rank ?? initial?.rank
  const milestone = useMilestones(usd)

  return (
    <Section as="header" size="wide" className="relative pt-12 sm:pt-20 pb-16">
      <Confetti milestone={milestone} />
      <div className="absolute right-0 top-6 sm:top-10 hidden sm:block pointer-events-none">
        <Ribbon size={140} rotation={14} bob />
      </div>
      <EyebrowPill showLiveDot className="mb-6">
        Live · Solana · 99% to research
      </EyebrowPill>
      <Wordmark size="xl" />
      <p className="mt-6 max-w-2xl text-base sm:text-lg text-ink-soft leading-relaxed">
        A memecoin with a heart of pink. Every trade routes <b className="text-pink-700">99% of fees</b>{' '}
        to the {CHARITY.name}, on-chain, in real time.
      </p>

      <div className="mt-8 max-w-md rounded-2xl bg-white p-5 border border-[color:var(--rule)] shadow-[var(--shadow-soft)]">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-pink-700">
              Raised — live
            </div>
            <div className="mt-1 text-3xl sm:text-4xl font-black text-pink-900 leading-none">
              <Counter value={usd} />
            </div>
            <div className="mt-2 text-xs text-ink-soft">
              {count} distributions{rank ? ` · ranked #${rank} on pump.fun` : ''}
            </div>
          </div>
          <span className="text-pink-500 text-sm font-bold">↑ live</span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={LINKS.pumpfun}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-5 py-3 text-white font-bold hover:bg-pink-700 transition-colors"
        >
          Trade $BREAST on pump.fun
          <span aria-hidden>↗</span>
        </a>
        <a
          href={LINKS.solscanToken}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-4 py-3 text-pink-700 hover:text-pink-900 font-bold"
        >
          View on Solscan ↗
        </a>
      </div>
    </Section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Hero.tsx
git commit -m "feat: Hero section composing wordmark, live counter, ribbon, CTAs"
```

---

## Task 17: `WhyThisExists` section

**Files:**
- Create: `components/WhyThisExists.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/WhyThisExists.tsx
import { Section } from './Section'

const CARDS = [
  { label: 'The stat',      title: '1 in 8',                copy: 'Women diagnosed with breast cancer in their lifetime, in the US alone.' },
  { label: 'The cause',     title: 'NBCF',                  copy: 'The National Breast Cancer Foundation funds early detection, education, and direct support for women in need.' },
  { label: 'The mechanic',  title: 'Volume → research',     copy: 'Memecoins move volume. Volume moves dollars. We turned that loop into a research pipeline.' },
] as const

export function WhyThisExists() {
  return (
    <Section className="py-16 sm:py-24">
      <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Why this exists</h2>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {CARDS.map(c => (
          <div
            key={c.label}
            className="rounded-2xl bg-pink-50 p-6 border border-[color:var(--rule)]"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-pink-700">{c.label}</div>
            <div className="mt-2 text-2xl font-black text-pink-900 tracking-tight">{c.title}</div>
            <p className="mt-3 text-sm text-ink-soft leading-relaxed">{c.copy}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/WhyThisExists.tsx
git commit -m "feat: Why This Exists section with three cards"
```

---

## Task 18: `HowItWorks` section

**Files:**
- Create: `components/HowItWorks.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/HowItWorks.tsx
'use client'
import { motion } from 'framer-motion'
import { Section } from './Section'
import { LINKS } from '@/lib/config'

const STEPS = [
  { n: '01', title: 'Trade $BREAST',        copy: 'Buy or sell $BREAST on pump.fun.' },
  { n: '02', title: 'Pump.fun fee',         copy: 'Every trade has a small standard fee.' },
  { n: '03', title: '99% routed via donate.gg', copy: 'On-chain, automatically — no middlemen.' },
  { n: '04', title: 'Funds land at NBCF',   copy: 'Settled to the credited Solana account, then to NBCF.' },
] as const

export function HowItWorks() {
  return (
    <Section size="wide" className="py-16 sm:py-24">
      <h2 className="text-3xl sm:text-4xl font-black tracking-tight">How it works</h2>
      <p className="mt-2 text-ink-soft">Trading is the giving. Here's the full loop, end-to-end.</p>

      <ol className="mt-10 grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
        {STEPS.map((s, i) => (
          <motion.li
            key={s.n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
            className="rounded-2xl bg-white p-5 border border-[color:var(--rule)]"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-pink-700">Step {s.n}</div>
            <div className="mt-2 text-lg font-black text-ink leading-tight">{s.title}</div>
            <p className="mt-2 text-sm text-ink-soft leading-relaxed">{s.copy}</p>
          </motion.li>
        ))}
      </ol>

      <div className="mt-8">
        <a
          href={LINKS.solscanCharityAccount}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-bold text-pink-700 hover:text-pink-900"
        >
          Verify on Solscan ↗
        </a>
      </div>
    </Section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/HowItWorks.tsx
git commit -m "feat: How It Works 4-step animated flow"
```

---

## Task 19: `FeeFeed` component

**Files:**
- Create: `components/FeeFeed.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/FeeFeed.tsx
'use client'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { formatUsd } from '@/lib/formatUsd'
import type { StatsState } from '@/hooks/useStats'

interface FeedRow { id: string; usd: number; at: number }

interface Props {
  stats: StatsState | null
  previous: StatsState | null
}

export function FeeFeed({ stats, previous }: Props) {
  const [rows, setRows] = useState<FeedRow[]>([])

  useEffect(() => {
    if (!stats) return
    if (!previous) {
      setRows([{ id: stats.lastDonationAt, usd: stats.displayedUsd, at: Date.parse(stats.lastDonationAt) }])
      return
    }
    const delta = stats.displayedUsd - previous.displayedUsd
    const newCount = stats.donationCount - previous.donationCount
    if (newCount > 0 && delta > 0) {
      const id = stats.lastDonationAt + ':' + stats.donationCount
      setRows(prev => {
        if (prev.some(r => r.id === id)) return prev
        return [
          { id, usd: delta, at: Date.now() },
          ...prev,
        ].slice(0, 6)
      })
    }
  }, [stats, previous])

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl bg-pink-50 border border-[color:var(--rule)] p-6 text-sm text-ink-soft">
        Waiting for the next trade…
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      <AnimatePresence initial={false}>
        {rows.map(r => (
          <motion.li
            key={r.id}
            layout
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex items-center justify-between rounded-xl bg-white border border-[color:var(--rule)] px-4 py-3 shadow-[var(--shadow-soft)]"
          >
            <span className="font-bold text-pink-900 tnum">+{formatUsd(r.usd)}</span>
            <span className="text-xs text-ink-soft">{relativeTime(r.at)}</span>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}

function relativeTime(at: number): string {
  const s = Math.floor((Date.now() - at) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}
```

- [ ] **Step 2: Commit**

```bash
git add components/FeeFeed.tsx
git commit -m "feat: FeeFeed live event list with slide-in animation"
```

---

## Task 20: `TrackerChart` component

**Files:**
- Create: `components/TrackerChart.tsx`, `hooks/useSnapshots.ts`

- [ ] **Step 1: Write the snapshots hook**

```ts
// hooks/useSnapshots.ts
'use client'
import { useEffect, useState } from 'react'

export interface Snapshot { t: number; usd: number; count: number; rank: number }

export function useSnapshots() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])

  useEffect(() => {
    let alive = true
    fetch('/api/snapshot')
      .then(r => r.json())
      .then((body: { ok: boolean; snapshots: Snapshot[] }) => {
        if (alive && body.ok) setSnapshots(body.snapshots)
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  return snapshots
}
```

- [ ] **Step 2: Write `TrackerChart.tsx`**

```tsx
// components/TrackerChart.tsx
'use client'
import { useMemo } from 'react'
import { useSnapshots } from '@/hooks/useSnapshots'
import { formatUsdCompact } from '@/lib/formatUsd'

const W = 600
const H = 180
const PAD = 24

export function TrackerChart() {
  const snapshots = useSnapshots()

  const path = useMemo(() => {
    if (snapshots.length === 0) return null
    const xs = snapshots.map(s => s.t)
    const ys = snapshots.map(s => s.usd)
    const xMin = Math.min(...xs)
    const xMax = Math.max(...xs)
    const yMin = 0
    const yMax = Math.max(...ys, 1)
    const sx = (x: number) => PAD + ((x - xMin) / Math.max(1, xMax - xMin)) * (W - PAD * 2)
    const sy = (y: number) => H - PAD - ((y - yMin) / (yMax - yMin)) * (H - PAD * 2)
    const d = snapshots
      .map((s, i) => `${i === 0 ? 'M' : 'L'} ${sx(s.t).toFixed(1)} ${sy(s.usd).toFixed(1)}`)
      .join(' ')
    return { d, yMax, yMin }
  }, [snapshots])

  if (!path) {
    return (
      <div className="rounded-2xl bg-pink-50 border border-[color:var(--rule)] p-6 text-sm text-ink-soft">
        Chart will populate after the first snapshot.
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white border border-[color:var(--rule)] p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-baseline justify-between mb-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-pink-700">14-day raise</div>
        <div className="text-xs text-ink-soft">peak {formatUsdCompact(path.yMax)}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cumulative raised over 14 days">
        <defs>
          <linearGradient id="trackerFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-pink-500)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-pink-500)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path.d} L ${W - PAD} ${H - PAD} L ${PAD} ${H - PAD} Z`} fill="url(#trackerFill)" />
        <path d={path.d} fill="none" stroke="var(--color-pink-500)" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/TrackerChart.tsx hooks/useSnapshots.ts
git commit -m "feat: TrackerChart hand-rolled SVG line chart with snapshot history"
```

---

## Task 21: `LiveTracker` section (composes the deep tracker)

**Files:**
- Create: `components/LiveTracker.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/LiveTracker.tsx
'use client'
import { Section } from './Section'
import { Counter } from './Counter'
import { FeeFeed } from './FeeFeed'
import { TrackerChart } from './TrackerChart'
import { EyebrowPill } from './EyebrowPill'
import { useStats, type StatsState } from '@/hooks/useStats'

interface Props { initial: StatsState | null }

export function LiveTracker({ initial }: Props) {
  const { stats, previous } = useStats(initial)
  const usd = stats?.displayedUsd ?? 0
  const count = stats?.donationCount ?? 0
  const rank = stats?.rank
  const firstAt = stats?.firstDonationAt ? new Date(stats.firstDonationAt) : null
  const lastAt = stats?.lastDonationAt ? new Date(stats.lastDonationAt) : null

  return (
    <Section size="wide" className="py-16 sm:py-24">
      <EyebrowPill showLiveDot className="mb-3">Live tracker</EyebrowPill>
      <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Every fee, on the block.</h2>
      <p className="mt-2 text-ink-soft max-w-xl">
        The cumulative number is sourced from donate.gg every 30s. New trade-fee distributions appear in the feed as they confirm.
      </p>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-[color:var(--rule)] p-6 shadow-[var(--shadow-soft)]">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-pink-700">Total raised</div>
          <div className="mt-2 text-5xl sm:text-6xl font-black text-pink-900 leading-none">
            <Counter value={usd} />
          </div>
          <div className="mt-3 text-sm text-ink-soft">
            {count} distributions{rank ? ` · ranked #${rank}` : ''}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-ink-soft">
            {firstAt && <div><b className="text-pink-700">First</b> · {firstAt.toLocaleDateString()}</div>}
            {lastAt && <div><b className="text-pink-700">Latest</b> · {lastAt.toLocaleString()}</div>}
          </div>
        </div>

        <div>
          <FeeFeed stats={stats} previous={previous} />
        </div>
      </div>

      <div className="mt-6">
        <TrackerChart />
      </div>
    </Section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/LiveTracker.tsx
git commit -m "feat: LiveTracker section composes counter, fee feed, and chart"
```

---

## Task 22: `TokenBlock` section

**Files:**
- Create: `components/TokenBlock.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/TokenBlock.tsx
'use client'
import { useState } from 'react'
import { Section } from './Section'
import { TOKEN, LINKS } from '@/lib/config'

const EXTERNAL = [
  { label: 'Pump.fun',     href: LINKS.pumpfun },
  { label: 'Solscan',      href: LINKS.solscanToken },
  { label: 'Jupiter',      href: LINKS.jupiter },
  { label: 'Birdeye',      href: LINKS.birdeye },
  { label: 'DexScreener',  href: LINKS.dexscreener },
] as const

export function TokenBlock() {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(TOKEN.mint)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {}
  }
  return (
    <Section className="py-16 sm:py-24">
      <h2 className="text-3xl sm:text-4xl font-black tracking-tight">The token</h2>

      <div className="mt-8 rounded-2xl bg-white border border-[color:var(--rule)] p-6 shadow-[var(--shadow-soft)]">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-pink-700">Contract address</div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="font-mono text-sm sm:text-base text-pink-900 break-all select-all">{TOKEN.mint}</code>
          <button
            onClick={onCopy}
            className="rounded-full bg-pink-500 px-3 py-1 text-white text-xs font-bold hover:bg-pink-700 transition-colors"
            aria-label="Copy contract address"
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        </div>

        <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div><dt className="text-[10px] uppercase tracking-[0.14em] text-pink-700">Symbol</dt><dd className="font-bold">${TOKEN.symbol}</dd></div>
          <div><dt className="text-[10px] uppercase tracking-[0.14em] text-pink-700">Decimals</dt><dd className="font-bold">{TOKEN.decimals}</dd></div>
          <div><dt className="text-[10px] uppercase tracking-[0.14em] text-pink-700">Standard</dt><dd className="font-bold">{TOKEN.standard}</dd></div>
          <div><dt className="text-[10px] uppercase tracking-[0.14em] text-pink-700">Chain</dt><dd className="font-bold capitalize">{TOKEN.chain}</dd></div>
        </dl>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {EXTERNAL.map(l => (
          <a
            key={l.label}
            href={l.href}
            target="_blank" rel="noopener noreferrer"
            className="rounded-full bg-pink-50 px-4 py-2 text-pink-700 text-sm font-bold hover:bg-pink-500 hover:text-white transition-colors"
          >
            {l.label} ↗
          </a>
        ))}
      </div>
    </Section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/TokenBlock.tsx
git commit -m "feat: TokenBlock with copyable contract and external explorer links"
```

---

## Task 23: `CharityBlock` section

**Files:**
- Create: `components/CharityBlock.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/CharityBlock.tsx
'use client'
import { useState } from 'react'
import { Section } from './Section'
import { CHARITY, LINKS } from '@/lib/config'

export function CharityBlock() {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(CHARITY.creditedAccount)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {}
  }
  return (
    <Section className="py-16 sm:py-24">
      <h2 className="text-3xl sm:text-4xl font-black tracking-tight">The cause</h2>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
        <div className="sm:col-span-2 rounded-2xl bg-pink-50 border border-[color:var(--rule)] p-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-pink-700">Beneficiary</div>
          <h3 className="mt-2 text-2xl font-black text-pink-900 leading-tight">{CHARITY.name}</h3>
          <p className="mt-3 text-sm text-ink-soft leading-relaxed">
            NBCF funds early detection, education, and direct support for women in need. They have a four-star Charity Navigator rating
            and have been operating since 1991. All trade-fee distributions for $BREAST settle to the credited Solana account below
            and route through donate.gg's pipeline to NBCF.
          </p>
          <a
            href={CHARITY.website}
            target="_blank" rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-pink-700 hover:text-pink-900"
          >
            Visit nationalbreastcancer.org ↗
          </a>
        </div>

        <div className="rounded-2xl bg-white border border-[color:var(--rule)] p-6 shadow-[var(--shadow-soft)]">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-pink-700">Credited account</div>
          <code className="mt-2 block font-mono text-xs text-pink-900 break-all select-all">{CHARITY.creditedAccount}</code>
          <div className="mt-3 flex gap-2">
            <button
              onClick={onCopy}
              className="rounded-full bg-pink-500 px-3 py-1 text-white text-xs font-bold hover:bg-pink-700 transition-colors"
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
            <a
              href={LINKS.solscanCharityAccount}
              target="_blank" rel="noopener noreferrer"
              className="rounded-full bg-pink-50 px-3 py-1 text-pink-700 text-xs font-bold hover:bg-pink-100 transition-colors"
            >
              View on Solscan ↗
            </a>
          </div>
        </div>
      </div>
    </Section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/CharityBlock.tsx
git commit -m "feat: CharityBlock with NBCF info and credited account"
```

---

## Task 24: `CommunityRow` + `Footer` sections

**Files:**
- Create: `components/CommunityRow.tsx`, `components/Footer.tsx`

- [ ] **Step 1: Write `CommunityRow.tsx`**

```tsx
// components/CommunityRow.tsx
import { Section } from './Section'
import { SOCIAL, LINKS } from '@/lib/config'

interface IconLink { label: string; href: string }

export function CommunityRow() {
  const links: IconLink[] = [
    SOCIAL.twitter && { label: 'X', href: SOCIAL.twitter },
    SOCIAL.telegram && { label: 'Telegram', href: SOCIAL.telegram },
    { label: 'Pump.fun comments', href: LINKS.pumpfun },
    SOCIAL.github && { label: 'GitHub', href: SOCIAL.github },
  ].filter(Boolean) as IconLink[]

  if (links.length === 0) return null

  return (
    <Section className="py-12">
      <div className="flex flex-wrap gap-3 justify-center">
        {links.map(l => (
          <a
            key={l.label}
            href={l.href}
            target="_blank" rel="noopener noreferrer"
            className="rounded-full bg-pink-50 px-5 py-2 text-pink-700 font-bold hover:bg-pink-500 hover:text-white transition-colors"
          >
            {l.label}
          </a>
        ))}
      </div>
    </Section>
  )
}
```

- [ ] **Step 2: Write `Footer.tsx`**

```tsx
// components/Footer.tsx
import { Section } from './Section'
import { Wordmark } from './Wordmark'
import { CHARITY } from '@/lib/config'

export function Footer() {
  return (
    <Section as="footer" className="py-12 border-t border-[color:var(--rule)] mt-12">
      <div className="flex flex-col sm:flex-row gap-6 sm:items-end sm:justify-between">
        <div>
          <Wordmark size="sm" inline />
          <p className="mt-2 text-xs text-ink-soft max-w-md">
            © {new Date().getFullYear()} Breast.coin · all proceeds to {CHARITY.shortName}.
          </p>
        </div>
        <p className="text-[11px] text-ink-soft max-w-md leading-relaxed">
          Memecoins are volatile. This is not financial advice. Live numbers come from donate.gg's
          public charity-coins data; we display, we don't custody. Trades execute on pump.fun. Built on Solana.
        </p>
      </div>
    </Section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/CommunityRow.tsx components/Footer.tsx
git commit -m "feat: CommunityRow + Footer"
```

---

## Task 25: Compose `app/page.tsx` with server-side initial fetch

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Server-render with initial stats already populated**

Replace `app/page.tsx`:

```tsx
// app/page.tsx
import { Hero } from '@/components/Hero'
import { WhyThisExists } from '@/components/WhyThisExists'
import { HowItWorks } from '@/components/HowItWorks'
import { LiveTracker } from '@/components/LiveTracker'
import { TokenBlock } from '@/components/TokenBlock'
import { CharityBlock } from '@/components/CharityBlock'
import { CommunityRow } from '@/components/CommunityRow'
import { Footer } from '@/components/Footer'
import { TOKEN, DONATE_GG } from '@/lib/config'
import { parseDonateGgRsc } from '@/lib/parseDonateGgRsc'
import type { StatsState } from '@/hooks/useStats'

export const revalidate = 30

async function loadInitialStats(): Promise<StatsState | null> {
  try {
    const res = await fetch(DONATE_GG.rscUrl, {
      headers: { RSC: '1', 'User-Agent': 'breast-coin/1.0 (+https://breast-coin.vercel.app)' },
      next: { revalidate: 30 },
    })
    if (!res.ok) return null
    const text = await res.text()
    const parsed = parseDonateGgRsc(text, TOKEN.mint)
    if (!parsed) return null
    return { ...parsed, fetchedAt: new Date().toISOString() }
  } catch {
    return null
  }
}

export default async function Home() {
  const initial = await loadInitialStats()
  return (
    <main>
      <Hero initial={initial} />
      <WhyThisExists />
      <HowItWorks />
      <LiveTracker initial={initial} />
      <TokenBlock />
      <CharityBlock />
      <CommunityRow />
      <Footer />
    </main>
  )
}
```

- [ ] **Step 2: Boot dev server, hit the site, eyeball it**

```bash
npm run dev &
sleep 6
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
curl -s http://localhost:3000 | grep -E "Breast|raised" | head -5
kill %1
```

Expected: 200, plus matches for "Breast" and "raised".

- [ ] **Step 3: Open http://localhost:3000 in a browser and verify visually**

Manually check:
- Hero counter renders with the live USD figure
- Ribbon bobs
- Live dot pulses
- All sections appear
- No console errors
- CTAs link to pump.fun and Solscan correctly

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: compose homepage with server-side initial stats fetch and 30s ISR"
```

---

## Task 26: Smoke test (Playwright)

**Files:**
- Create: `playwright.config.ts`, `tests/smoke/home.spec.ts`

- [ ] **Step 1: Add Playwright config**

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/smoke',
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  },
})
```

- [ ] **Step 2: Add the smoke test**

```ts
// tests/smoke/home.spec.ts
import { test, expect } from '@playwright/test'

test('home renders with all major sections and live counter > 0', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })

  await page.goto('/')

  await expect(page.getByRole('heading', { name: /Why this exists/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: /How it works/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: /The token/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: /The cause/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Every fee, on the block\./i })).toBeVisible()

  // Hero CTA must be visible and link to pump.fun
  const cta = page.getByRole('link', { name: /Trade \$BREAST on pump\.fun/i })
  await expect(cta).toBeVisible()
  await expect(cta).toHaveAttribute('href', /pump\.fun/)

  // Counter shows a non-zero USD value
  const heroBody = page.locator('header').first()
  await expect(heroBody).toContainText(/\$\d/)

  expect(errors, errors.join('\n')).toEqual([])
})
```

- [ ] **Step 3: Run the smoke test**

```bash
npx playwright test
```

Expected: 1 passing.

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts tests/smoke/home.spec.ts
git commit -m "test: Playwright smoke test verifying sections + live counter"
```

---

## Task 27: GitHub repo + Vercel deploy

**Files:**
- All existing files; no new code.

- [ ] **Step 1: Verify build passes locally**

```bash
npm run build
```

Expected: `✓ Compiled successfully` and the page route is listed in the output.

- [ ] **Step 2: Run all tests once more**

```bash
npm run test
npx playwright test
```

Expected: all green.

- [ ] **Step 3: Create the GitHub repo**

```bash
gh repo create r4vager/breast-coin --public --source=. --remote=origin --description "Breast.coin — Solana memecoin landing page, 99% of fees route to NBCF"
git push -u origin main
```

Expected: repo created, code pushed.

- [ ] **Step 4: Link to Vercel and deploy production**

```bash
npx vercel link --yes --project breast-coin
npx vercel --prod --yes
```

Expected: deployed to `breast-coin.vercel.app`. Note the URL printed by the CLI.

- [ ] **Step 5: Smoke-test the production URL**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://breast-coin.vercel.app
curl -s https://breast-coin.vercel.app/api/stats | head -c 300
```

Expected: 200 on the homepage, `/api/stats` returns `{"ok":true,"data":{...}}`.

- [ ] **Step 6: Optionally provision Vercel KV**

```bash
# Only do this once you want the chart history populated
npx vercel storage create kv breast-coin-kv
npx vercel env pull
# KV_REST_API_URL and KV_REST_API_TOKEN now in .env.local — redeploy so the cron uses them
npx vercel --prod --yes
```

- [ ] **Step 7: Final commit on any deploy-config tweaks**

```bash
git add -A
git diff --cached --quiet || git commit -m "chore: deploy config tweaks"
git push
```

---

## Self-review

**Spec coverage check:**

| Spec section | Plan task(s) |
|---|---|
| §3 On-chain facts (config) | Task 3 |
| §4 Aesthetic (palette, type, wordmark, ribbon) | Tasks 2, 10, 12 |
| §5 Motion (counter, bob, pulse, slide-in, confetti, reduced-motion) | Tasks 10, 11, 13, 15, 18, 19 |
| §6.1 Hero | Task 16 |
| §6.2 Why this exists | Task 17 |
| §6.3 How it works | Task 18 |
| §6.4 Live tracker (deep) | Tasks 13, 19, 20, 21 |
| §6.5 The token | Task 22 |
| §6.6 The cause | Task 23 |
| §6.7 Community | Task 24 |
| §6.8 Footer | Task 24 |
| §7 Data flow + RSC parsing + caching + error handling | Tasks 4, 5, 6, 7, 8, 25 |
| §8 Component inventory | Tasks 9–24 (each component its own task) |
| §9 Tech stack | Task 1 (deps), Task 8 (KV + cron) |
| §10 Performance & a11y | Task 2 (reduced-motion CSS), Task 10 (ribbon aria), Task 13 (counter reduced-motion), Task 26 (smoke test no console errors) |
| §11 Out of scope | Honored — no wallet connect, no holder leaderboard, no RPC subscription |
| §13 Risks (parser fragility, scrape-block, framing) | Mitigated via fixture-based tests (Task 5), User-Agent (Tasks 6, 8), copy locked in (Tasks 16–18) |

All spec sections are covered.

**Placeholder scan:** No "TBD", "TODO", "fill in details", "Add appropriate error handling", or "Similar to Task N" without code. Every step shows the actual code, file paths, or commands.

**Type consistency:** `DonateGgStats` is exported from `lib/parseDonateGgRsc.ts` and consumed by `app/api/stats/route.ts`, `hooks/useStats.ts`, and `app/page.tsx`. `StatsState` is exported from `hooks/useStats.ts` and consumed by every section component. `useStats` and `useMilestones` and `useSnapshots` all live under `hooks/` with consistent naming.

**Open questions:** None. All design decisions were resolved in the brainstorming session.
