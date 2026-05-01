import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { TOKEN, DONATE_GG } from '@/lib/config'
import { parseDonateGgRsc, type DonateGgStats } from '@/lib/parseDonateGgRsc'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
