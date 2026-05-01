const usdFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const compactFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatUsd(n: number): string {
  return usdFmt.format(n)
}

export function formatUsdCompact(n: number): string {
  return compactFmt.format(n)
}

export function fromMicroUsd(microUsdE6: string | number | bigint): number {
  const big = typeof microUsdE6 === 'bigint' ? microUsdE6 : BigInt(microUsdE6)
  return Number(big) / 1_000_000
}
