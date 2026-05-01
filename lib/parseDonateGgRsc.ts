export interface DonateGgStats {
  displayedUsd: number
  finalizedUsd: number
  pendingUsd: number
  displayedUsdE6: number
  donationCount: number
  pendingCount: number
  finalizedCount: number
  rank: number
  firstDonationAt: string
  lastDonationAt: string
}

/**
 * Parse a donate.gg charity-coins RSC payload and extract stats for one token mint.
 *
 * Each entry is shaped { donationSubject: { token: { address, symbol, ... } },
 * pendingUsdE6, finalizedUsdE6, displayedUsdE6, pendingCount, finalizedCount,
 * donationCount, firstDonationAt, lastDonationAt, rank } — stats appear AFTER
 * the token block.
 */
export function parseDonateGgRsc(payload: string, mint: string): DonateGgStats | null {
  if (!payload || !mint) return null

  const idx = payload.indexOf(mint)
  if (idx === -1) return null

  const window = payload.slice(idx, idx + 1500)

  const num = (re: RegExp) => {
    const m = window.match(re)
    return m ? m[1] : null
  }

  const displayedE6 = num(/"displayedUsdE6":"\$n(\d+)"/)
  const finalizedE6 = num(/"finalizedUsdE6":"\$n(\d+)"/)
  const pendingE6 = num(/"pendingUsdE6":"\$n(\d+)"/)
  const donationCount = num(/"donationCount":(\d+)/)
  const pendingCount = num(/"pendingCount":(\d+)/)
  const finalizedCount = num(/"finalizedCount":(\d+)/)
  const rank = num(/"rank":(\d+)/)
  const firstAt = num(/"firstDonationAt":"\$D([^"]+)"/)
  const lastAt = num(/"lastDonationAt":"\$D([^"]+)"/)

  if (
    displayedE6 === null || finalizedE6 === null || pendingE6 === null ||
    donationCount === null || pendingCount === null || finalizedCount === null ||
    rank === null || firstAt === null || lastAt === null
  ) {
    return null
  }

  const toUsd = (e6: string) => Number(BigInt(e6)) / 1_000_000

  return {
    displayedUsd: toUsd(displayedE6),
    finalizedUsd: toUsd(finalizedE6),
    pendingUsd: toUsd(pendingE6),
    displayedUsdE6: Number(displayedE6),
    donationCount: Number(donationCount),
    pendingCount: Number(pendingCount),
    finalizedCount: Number(finalizedCount),
    rank: Number(rank),
    firstDonationAt: firstAt,
    lastDonationAt: lastAt,
  }
}
