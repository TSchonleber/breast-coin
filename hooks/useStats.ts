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
        // silent
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
