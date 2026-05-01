# breast-coin redesign — design spec

**Date:** 2026-04-30
**Author:** Claude Code (via brainstorming session with Terrence)
**Status:** Approved, ready for implementation plan
**Repo:** `r4vager/breast-coin` (new) → Vercel → `breast-coin.vercel.app`
**Replaces:** `breastcoin.vercel.app` (current, unrelated repo)

---

## 1. What we're building

A new landing page for **$BREAST**, a Solana memecoin launched via pump.fun's charity-coin integration. 99% of pump.fun trade fees on $BREAST are routed on-chain through donate.gg to the **National Breast Cancer Foundation (NBCF)**.

The redesign replaces a generic memecoin page (cherry innuendo, no mention of the cause) with a site that:

1. Foregrounds the cause without losing memecoin energy.
2. Shows a **live, animated tracker** of cumulative funds raised, sourced from donate.gg's public RSC payload, refreshed every 30 seconds.
3. Reframes the entire mechanic so users understand: **trading $BREAST is the giving.** Fees are not direct donations — they accrue from trade volume on pump.fun and route to NBCF automatically.

The site is read-only marketing + live data. No wallet connect. No on-site trading UI. The CTA links out to pump.fun.

## 2. Audience & success criteria

**Primary audience:** Crypto-native users on Solana / pump.fun who skim, decide in 5 seconds, and either trade or bounce.
**Secondary audience:** Press, NBCF stakeholders, and non-crypto observers — the page should not embarrass the cause.

**Success criteria:**
- A first-time visitor sees the live `$X raised` figure within 1 second of paint.
- A first-time visitor understands the trade-fees-fund-research mechanic without reading more than 30 words.
- The CTA "Trade $BREAST on pump.fun" is the most visible thing other than the wordmark.
- The live counter visibly updates within the user's session (within 30s).
- Lighthouse: ≥ 95 on Performance, Accessibility, Best Practices on mobile.

## 3. On-chain & data facts (immutable)

| Item | Value |
|---|---|
| Token mint | `4ZdhpbJJNPBHNYVGfv41DRfTytjrb6Yg5P4y5iuRpump` |
| Token name / symbol | Breastcoin / `BREAST` |
| Token standard | SPL_TOKEN2022, 6 decimals, Solana mainnet (chainId 101) |
| Charity beneficiary | National Breast Cancer Foundation (NBCF) |
| Credited Solana account | `GvUieqisLLDdUeB3yDYuQPgCV14urh5BS4En59bXTgvU` |
| Donation source program | Pump Fees Program — `pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ` |
| Fee share to charity | 99% of every trade |
| Live data source | `GET https://www.donate.gg/charity-coins?_rsc=1` (header `RSC: 1`, public, no auth) |
| Donate.gg developer project | `cmnclolhj000004l7nxya5mxs` (visible in RSC, not used by us) |

## 4. Aesthetic direction — "Polished Pop"

Cream-and-hot-pink, designer-grade, modern but never sterile.

### 4.1 Palette

| Token | Hex | Use |
|---|---|---|
| `--cream` | `#fff5ec` | Page background, default surface |
| `--ink` | `#14060f` | Primary text, wordmark base |
| `--ink-soft` | `#4a2230` | Body copy |
| `--pink-50` | `#fdf2f8` | Card surfaces, subtle fills |
| `--pink-500` | `#ec4899` | Primary accent (CTAs, ribbon, live dot, wordmark accent) |
| `--pink-700` | `#be185d` | Eyebrows, hover states, accent text |
| `--pink-900` | `#831843` | Display numerals (counter), footer copy |
| `--rule` | `rgba(190,24,93,0.18)` | Card borders, hairlines |
| `--shadow-soft` | `0 8px 22px -16px rgba(190,24,93,0.5)` | Card lift |

### 4.2 Typography

- **Single family:** Inter (variable). One HTTP request via `next/font`.
- **Weights:** 400 / 500 / 700 / 900.
- **Display headlines & wordmark:** Inter 900, letter-spacing -0.04em, line-height 0.95.
- **Body:** Inter 500, ~14px–16px, line-height 1.45–1.5.
- **Eyebrow / labels:** Inter 700, uppercase, letter-spacing 0.08em–0.18em.
- **Numerals everywhere money or counts appear:** `font-variant-numeric: tabular-nums`.

### 4.3 Wordmark

`Breast.coin` — capital B-r-e-a-s-t, hot-pink full stop, line break, lowercase `coin`. Optionally fits inline at smaller sizes. The dot is the only chromatic element in the wordmark; it carries the brand color.

### 4.4 Ribbon

A custom inline SVG (not emoji), filled `--pink-500` with a `--pink-900` 2px stroke. The path lives in `components/Ribbon.tsx` so it can be reused at any size. Hero version is ~110×130px, rotated 14°, gently bobbing on a 4s ease-in-out loop.

## 5. Motion philosophy — "Polished Delight"

Animations have a heartbeat but never pull focus from the data or the cause.

| Element | Motion |
|---|---|
| Live dot in eyebrow pill | Concentric ring pulse, 1.4s loop, `--pink-500` → transparent |
| Hero ribbon | Bob 8px + scale 1.04 on a 3.2s ease-in-out loop, rotate -4° at peak |
| Hero counter card | Float -3px on a 4s ease-in-out loop |
| Counter number | Animate from previous value to new value over 800ms with `framer-motion`'s `useMotionValue` + `animate(...)`, formatted with `Intl.NumberFormat('en-US', { style:'currency', currency:'USD' })`. Tabular nums prevent width jitter. |
| Counter "↑ live" arrow | Soft up-bob, 1.6s loop |
| Fee feed rows | Slide in from right, fade in, 350ms `easeOut`. New row pushes older rows down. Max 6 visible. |
| Confetti | One-shot drift on milestone crossings (`$5K`, `$10K`, `$25K`, `$50K`, `$100K`, then every $50K). 8–12 ribbons + circles in palette colors, 2.5–3.5s per piece, no recycling. Stored in `localStorage` so reloads don't re-fire. |
| Section reveals | Subtle 12px translate-up + fade, 600ms `easeOut`, triggered once via `IntersectionObserver` (or Framer Motion's `whileInView`). |
| Hover micro-interactions | Cards: `translateY(-4px)` + soft shadow lift. Buttons: `bg` darken 6%, scale 1.02. CTAs: ribbon icon does a single full rotation on hover. |
| Reduced motion | All non-essential animations disabled via `prefers-reduced-motion: reduce`. Counter still animates the value change but in a single frame; no bobbing, no confetti. |

## 6. Information architecture (sections)

In page order, single long scroll. No anchor nav for v1; the page is short enough.

### 6.1 Hero
- Eyebrow pill: `● Live · Solana · 99% to research`
- Wordmark: `Breast.coin`
- Tagline: *A memecoin with a heart of pink. Every trade routes 99% of fees to the National Breast Cancer Foundation, on-chain, in real time.*
- **Live counter card** (the live tracker): `displayedUsd` (large, animated), caption `raised · N donations · #rank charity coin on pump.fun`, "↑ live" indicator.
- Primary CTA: `Trade $BREAST on pump.fun ↗` (solid `--pink-500`, white text)
- Secondary CTA: `View on Solscan ↗` (text link)
- Bobbing ribbon SVG, top-right.

### 6.2 Why this exists
3 cards in a row (1 column on mobile):
1. **The stat.** *1 in 8 women will be diagnosed with breast cancer in their lifetime.*
2. **The cause.** *NBCF funds early detection, education, and support for women in need.*
3. **The mechanic.** *Memecoins move volume. Volume moves dollars. We turned that loop into a research pipeline.*

### 6.3 How it works
4-step horizontal flow (vertical on mobile), animated in via scroll:
1. Trade $BREAST on pump.fun.
2. Pump.fun's standard fee on every trade.
3. 99% of that fee routes through donate.gg's on-chain pipeline.
4. Funds land at NBCF's credited Solana account, distributed by donate.gg.

Each step has a small icon/illustration and one sentence. Final card has a "Verify on Solscan" link to the credited account.

### 6.4 Live tracker (deep)
Two-column on desktop, stacked on mobile:
- **Left:** Large cumulative raised number (animated, USD), donation count, first-distribution timestamp, last-distribution timestamp, current rank, percent change since you opened the page.
- **Right:** Live fee-event feed. Each row: `+$X.XX · Nm ago` (no wallet addresses — these are aggregated charity distributions, not user gifts). Auto-updates as new events come in. Empty state: *Waiting for the next trade…*
- Below: a 14-day cumulative line chart (uses snapshots stored in Vercel KV; falls back to a single point if no history yet).

### 6.5 The token
- Contract address `4Zdh...uRpump` with copy button (full address shown, monospaced).
- Token standard, decimals, chain.
- External links: pump.fun (primary), Solscan, Jupiter, Birdeye, DexScreener.
- No tokenomics table (current site's table is mostly noise; pump.fun handles tokenomics).

### 6.6 The cause (NBCF)
- NBCF logo (fetched from their site or hosted locally with attribution).
- One paragraph about NBCF's mission, sourced from their public materials.
- Credited Solana account: `GvUi...TgvU` with copy button + Solscan link.
- External link to nationalbreastcancer.org.

### 6.7 Community
Single row of icons: X (Twitter), Telegram, Pump.fun comments. URLs configured in `lib/config.ts`; any handle that's empty is hidden, so the row scales 1–N icons cleanly. (If the repo is intended to be public, a GitHub icon can be added the same way.)

### 6.8 Footer
- Wordmark, copyright `© 2026 Breast.coin · all proceeds to NBCF`.
- Disclaimer: memecoin volatility, not financial advice, no guarantees of charity totals (we just display donate.gg's reported numbers).
- Attribution: `Live data via donate.gg · Trades via pump.fun · Built on Solana`.

## 7. Data flow

```
Browser (Server Component)        renders sections 1, 2, 3, 5, 6, 7, 8 statically (ISR every 30s)
Browser (Client Component)        hero counter + section 4 live tracker
        │
        │ poll every 30s
        ▼
Next.js Route Handler             /api/stats
        │
        │ unstable_cache(30s)
        ▼
fetch(donate.gg RSC)              GET https://www.donate.gg/charity-coins?_rsc=1
        │                         Header: RSC: 1
        │
        │ regex extract Breastcoin entry
        │ parse {pendingUsdE6, finalizedUsdE6, displayedUsdE6, donationCount, rank, firstDonationAt, lastDonationAt}
        ▼
return JSON                       { displayedUsd: 10005.07, donationCount: 37, rank: 12, firstAt: "...", lastAt: "..." }

(parallel) Vercel Cron (5min)     Reads /api/stats, appends snapshot to Vercel KV for the 14-day chart
```

### 7.1 RSC payload parsing

The donate.gg page is a Next.js App Router app. Adding `?_rsc=1` and the `RSC: 1` header returns the React Server Component flight payload (~55KB plain text). We grep for the Breastcoin entry by exact mint address `4ZdhpbJJNPBHNYVGfv41DRfTytjrb6Yg5P4y5iuRpump` and pull the immediately-following stats block.

The flight format encodes BigInts as `"$n<digits>"` and dates as `"$D<iso>"`. Parser handles both.

```ts
// Pseudocode
const text = await fetch(URL, { headers: { RSC: '1' } }).then(r => r.text())
const idx = text.indexOf('4ZdhpbJJNPBHNYVGfv41DRfTytjrb6Yg5P4y5iuRpump')
const window = text.slice(idx, idx + 1500)
const match = window.match(/"displayedUsdE6":"\$n(\d+)".*?"donationCount":(\d+).*?"rank":(\d+)/)
const [_, e6, count, rank] = match!
return {
  displayedUsd: Number(BigInt(e6)) / 1_000_000,
  donationCount: Number(count),
  rank: Number(rank),
  // ...firstAt, lastAt parsed similarly
}
```

### 7.2 Caching

- `unstable_cache(fetcher, ['donate-gg-stats'], { revalidate: 30 })` on the server.
- Route handler returns `Cache-Control: public, s-maxage=30, stale-while-revalidate=120`.
- Client polls every 30s with a small jitter (±3s) to avoid thundering herds.
- On poll failure: keep last value, show no error UI for the user (silent retry next tick).

### 7.3 Error handling

- If donate.gg returns non-200: log, return last cached value with a `stale: true` flag. UI ignores the flag (silent), but it's logged for ops.
- If the regex doesn't match (page structure changed): return `{ error: 'parse_failed' }`. UI shows the last known value but stops the "↑ live" indicator. Surface the failure in Vercel logs / Sentry (if added later).
- If the route handler 5xxs: client retries once on next tick.
- The chart endpoint is allowed to be empty/sparse — degrades gracefully.

## 8. Component inventory

```
components/
  Wordmark.tsx           # `Breast.coin` with the pink dot, scaling props
  Ribbon.tsx             # SVG, `size`, `rotation`, `bob` props
  LiveDot.tsx            # Pulsing dot with concentric ring
  Counter.tsx            # Animated USD counter, framer-motion useMotionValue
  EyebrowPill.tsx        # Live · Solana · 99% to research, with optional dot
  StatCard.tsx           # Big number + caption variant
  HowItWorksFlow.tsx     # 4-step animated flow
  FeeFeed.tsx            # List of fee events with slide-in animation
  TrackerChart.tsx       # 14-day cumulative line chart, hand-rolled inline SVG (no chart-lib dep)
  TokenBlock.tsx         # Contract address + copy + external links
  CharityBlock.tsx       # NBCF info + credited account
  CommunityRow.tsx       # Social icon row
  Confetti.tsx           # One-shot milestone confetti, localStorage-gated
  Section.tsx            # Wrapper with consistent padding/max-width
app/
  layout.tsx             # Inter font, metadata, OG tags
  page.tsx               # Composes all sections
  api/
    stats/route.ts       # GET handler, RSC scrape + parse
    snapshot/route.ts    # POST handler (Vercel Cron) for chart history
hooks/
  useStats.ts            # SWR-style polling hook for /api/stats
  useMilestones.ts       # Detects threshold crossings, fires confetti
lib/
  parseDonateGgRsc.ts    # The grep-and-parse utility (unit tested)
  formatUsd.ts           # Intl.NumberFormat helper, tabular-nums-friendly
  config.ts              # All on-chain addresses, donate.gg URL, milestones[]
public/
  ribbon.svg             # If we want a static fallback
  og-image.png           # 1200x630 OG image
```

## 9. Tech stack

- **Framework:** Next.js 16 (App Router), TypeScript strict mode.
- **Styling:** Tailwind CSS 4. CSS variables for the palette, set in `globals.css`. No CSS-in-JS.
- **Animation:** `framer-motion` for the counter, ribbon, fee feed, section reveals, confetti.
- **Storage:** Vercel KV for the 14-day chart history (one snapshot every 5 min). Chart degrades gracefully if KV returns empty (renders a single point).
- **Cron:** `vercel.json` cron pinging `/api/snapshot` every 5 minutes.
- **Fonts:** `next/font/google` Inter (variable). One request, self-hosted.
- **Icons:** `lucide-react` for social/external icons. Custom SVG for the ribbon.
- **Testing:** Vitest for `parseDonateGgRsc` (uses fixture from a real donate.gg payload). One Playwright smoke test (renders, counter is non-zero).

## 10. Performance & accessibility

- Above-the-fold render is a Server Component — counter card hydrates with the cached value already rendered, then upgrades to live polling on the client.
- Fonts loaded via `next/font` with `display: swap` and pre-load.
- Ribbon is inline SVG, no image request.
- LCP target: hero counter card or wordmark (both server-rendered).
- All interactive elements meet WCAG 2.1 AA contrast on the cream background.
- `prefers-reduced-motion` disables ribbon bob, counter card float, fee-feed slide, confetti, and section reveals.
- Keyboard nav: every CTA + external link is tabbable with a visible focus ring (`outline: 2px solid var(--pink-500); outline-offset: 2px`).
- Alt text on the ribbon SVG is `Pink ribbon, breast cancer awareness symbol`.
- Decorative animations have `aria-hidden="true"`.

## 11. Out of scope (v1)

- Wallet connect / in-page trading UI.
- Solana RPC subscription for sub-second updates (polling-only for v1; can be added later).
- Custom domain (vercel.app subdomain only).
- Holder leaderboard.
- Per-tx Solana explorer scraping (we use donate.gg's aggregate; "view tx" link in the feed points to Solscan for the credited account, not per-event).
- A roadmap section, FAQ, press quotes, testimonials.
- Multilingual support.
- Email capture / newsletter.
- Anything that requires a backend database.

## 12. Open questions / TODOs (resolved before merge)

None. All open items from the brainstorm were resolved during the session:
- Aesthetic: Polished Pop ✓
- Motion: Polished Delight ✓
- Charity: NBCF ✓
- Domain: breast-coin.vercel.app ✓
- Real-time strategy: polling, 30s ✓
- Data path: donate.gg RSC scrape ✓
- Live feed framing: trade-fee distributions, not user donations ✓

## 13. Risks

| Risk | Mitigation |
|---|---|
| donate.gg changes their RSC payload structure | Parser is isolated in `lib/parseDonateGgRsc.ts` with a fixture-based test. Swap implementation when it breaks; fall back to last-known-good value in the meantime. |
| donate.gg blocks scraping (Cloudflare, rate limit) | Cache aggressively (30s server, 30s client), add `User-Agent: breast-coin/1.0 (+breast-coin.vercel.app)` so they can identify and reach out. If blocked, pivot to direct Solana RPC reads of the credited account. |
| Pump.fun changes fee mechanics or partnership | Cosmetic fix only — site copy says "fees route to NBCF" which remains true regardless of pump.fun's specific mechanics. |
| Volume drops, counter doesn't visibly move | Acceptable. The site still shows the cumulative total. The "↑ live" indicator only fires on actual increases. |
| User confusion about "donation" framing | Already addressed in copy: live feed labels distributions as `+$X.XX` without "from donor" framing. "How it works" section explains the trade-fee mechanic explicitly. |

---

**End of spec.**
