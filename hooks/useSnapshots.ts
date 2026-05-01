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
