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
