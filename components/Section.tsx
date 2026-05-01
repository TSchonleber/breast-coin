import { type HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'header' | 'footer'
  size?: 'normal' | 'narrow' | 'wide'
}

const widths = {
  narrow: 'max-w-3xl',
  normal: 'max-w-5xl',
  wide: 'max-w-6xl',
} as const

export function Section({
  as: Tag = 'section',
  size = 'normal',
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <Tag
      {...rest}
      className={`w-full mx-auto px-5 sm:px-8 ${widths[size]} ${className}`}
    >
      {children}
    </Tag>
  )
}
