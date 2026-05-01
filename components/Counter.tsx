'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, animate as fmAnimate } from 'framer-motion'
import { formatUsd } from '@/lib/formatUsd'

interface Props {
  value: number
  className?: string
  duration?: number
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
