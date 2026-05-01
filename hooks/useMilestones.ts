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
  } catch {}
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
        const t = window.setTimeout(() => setCrossed(null), 6000)
        return () => window.clearTimeout(t)
      }
    }
  }, [currentUsd])

  return crossed
}
