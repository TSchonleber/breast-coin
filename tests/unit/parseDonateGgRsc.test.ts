import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { parseDonateGgRsc } from '@/lib/parseDonateGgRsc'

const fixture = readFileSync(
  path.resolve(__dirname, '../fixtures/donate-gg-rsc.txt'),
  'utf8',
)

const BREAST_MINT = '4ZdhpbJJNPBHNYVGfv41DRfTytjrb6Yg5P4y5iuRpump'

describe('parseDonateGgRsc', () => {
  it('extracts the Breastcoin entry', () => {
    const stats = parseDonateGgRsc(fixture, BREAST_MINT)
    expect(stats).not.toBeNull()
    expect(stats!.displayedUsd).toBeGreaterThan(0)
    expect(stats!.donationCount).toBeGreaterThan(0)
    expect(stats!.rank).toBeGreaterThan(0)
    expect(stats!.firstDonationAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(stats!.lastDonationAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('parses USD-E6 BigInt strings into USD numbers', () => {
    const stats = parseDonateGgRsc(fixture, BREAST_MINT)!
    expect(stats.displayedUsd).toBeCloseTo(stats.displayedUsdE6 / 1_000_000, 6)
  })

  it('returns null when the mint is not present', () => {
    const stats = parseDonateGgRsc(fixture, 'NotARealMint11111111111111111111111111pump')
    expect(stats).toBeNull()
  })

  it('returns null when the payload is malformed', () => {
    expect(parseDonateGgRsc('not a valid payload', BREAST_MINT)).toBeNull()
    expect(parseDonateGgRsc('', BREAST_MINT)).toBeNull()
  })
})
