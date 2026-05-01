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
