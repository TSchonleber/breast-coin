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
  milestone: number | null
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
