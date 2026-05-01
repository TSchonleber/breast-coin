import { describe, it, expect } from 'vitest'
import { formatUsd, formatUsdCompact, fromMicroUsd } from '@/lib/formatUsd'

describe('formatUsd', () => {
  it('formats whole dollars with the $ sign and two decimals', () => {
    expect(formatUsd(10005.07)).toBe('$10,005.07')
  })

  it('formats zero as $0.00', () => {
    expect(formatUsd(0)).toBe('$0.00')
  })

  it('rounds half to even at the cent boundary', () => {
    expect(formatUsd(0.005)).toBe('$0.01')
  })
})

describe('formatUsdCompact', () => {
  it('renders 999 as $999', () => {
    expect(formatUsdCompact(999)).toBe('$999')
  })
  it('renders 1500 as $1.5K', () => {
    expect(formatUsdCompact(1500)).toBe('$1.5K')
  })
  it('renders 12_500_000 as $12.5M', () => {
    expect(formatUsdCompact(12_500_000)).toBe('$12.5M')
  })
})

describe('fromMicroUsd', () => {
  it('converts the donate.gg displayedUsdE6 BigInt string to USD', () => {
    expect(fromMicroUsd('10005073295')).toBe(10005.073295)
  })
  it('handles "0"', () => {
    expect(fromMicroUsd('0')).toBe(0)
  })
})
