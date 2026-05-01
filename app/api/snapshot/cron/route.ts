// Vercel cron POST endpoint. Reads donate.gg, appends snapshot to KV.
// Falls back gracefully if KV is unconfigured.
import { NextResponse } from 'next/server'
import { TOKEN, DONATE_GG } from '@/lib/config'
import { parseDonateGgRsc } from '@/lib/parseDonateGgRsc'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const KV_KEY = 'breast-coin:snapshots'
const MAX_SNAPSHOTS = 14 * 24 * 12  // 14 days × 24 hours × 12 (every 5 min)

export async function GET(req: Request) {
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

  if (!process.env.KV_REST_API_URL) {
    return NextResponse.json({ ok: true, kv: 'not_configured', snapshot: JSON.parse(snapshot) })
  }

  const { kv } = await import('@vercel/kv')
  await kv.zadd(KV_KEY, { score: now, member: snapshot })
  const total = (await kv.zcard(KV_KEY)) ?? 0
  if (total > MAX_SNAPSHOTS) {
    await kv.zremrangebyrank(KV_KEY, 0, total - MAX_SNAPSHOTS - 1)
  }
  return NextResponse.json({ ok: true, kv: 'written', snapshot: JSON.parse(snapshot) })
}
