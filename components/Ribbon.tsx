'use client'
import { motion } from 'framer-motion'

interface Props {
  size?: number
  rotation?: number
  bob?: boolean
  className?: string
  ariaHidden?: boolean
}

export function Ribbon({
  size = 110,
  rotation = 14,
  bob = false,
  className = '',
  ariaHidden = false,
}: Props) {
  const path = (
    <>
      <path
        d="M50 30 C 40 10, 20 10, 25 35 L 45 75 L 50 60 L 55 75 L 75 35 C 80 10, 60 10, 50 30 Z"
        fill="var(--color-pink-500)"
      />
      <path
        d="M50 30 C 40 10, 20 10, 25 35 L 45 75 L 50 60 L 55 75 L 75 35 C 80 10, 60 10, 50 30 Z"
        fill="none"
        stroke="var(--color-pink-900)"
        strokeWidth="2"
      />
      <path
        d="M45 75 L 38 110 L 50 95 L 62 110 L 55 75"
        fill="var(--color-pink-500)"
        stroke="var(--color-pink-900)"
        strokeWidth="2"
      />
    </>
  )

  const Svg = (
    <svg
      width={size}
      height={(size * 130) / 110}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={ariaHidden ? undefined : 'img'}
      aria-hidden={ariaHidden ? true : undefined}
      aria-label={ariaHidden ? undefined : 'Pink ribbon, breast cancer awareness symbol'}
      className={className}
    >
      {path}
    </svg>
  )

  if (!bob) {
    return <span style={{ display: 'inline-block', transform: `rotate(${rotation}deg)` }}>{Svg}</span>
  }

  return (
    <motion.span
      style={{ display: 'inline-block', transformOrigin: '50% 100%' }}
      animate={{
        rotate: [rotation, rotation - 4, rotation],
        y: [0, -8, 0],
        scale: [1, 1.04, 1],
      }}
      transition={{ duration: 3.2, ease: 'easeInOut', repeat: Infinity }}
    >
      {Svg}
    </motion.span>
  )
}
