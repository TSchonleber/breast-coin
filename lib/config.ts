// lib/config.ts
export const TOKEN = {
  mint: '4ZdhpbJJNPBHNYVGfv41DRfTytjrb6Yg5P4y5iuRpump',
  symbol: 'BREAST',
  name: 'Breastcoin',
  decimals: 6,
  standard: 'SPL_TOKEN2022',
  chainId: 101,
  chain: 'solana',
} as const

export const CHARITY = {
  name: 'National Breast Cancer Foundation',
  shortName: 'NBCF',
  website: 'https://www.nationalbreastcancer.org',
  creditedAccount: 'GvUieqisLLDdUeB3yDYuQPgCV14urh5BS4En59bXTgvU',
} as const

export const DONATE_GG = {
  rscUrl: 'https://www.donate.gg/charity-coins?_rsc=1',
  donationSourceProgram: 'pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ',
} as const

export const LINKS = {
  pumpfun: `https://pump.fun/coin/${'4ZdhpbJJNPBHNYVGfv41DRfTytjrb6Yg5P4y5iuRpump'}`,
  solscanToken: `https://solscan.io/token/${'4ZdhpbJJNPBHNYVGfv41DRfTytjrb6Yg5P4y5iuRpump'}`,
  solscanCharityAccount: `https://solscan.io/account/${'GvUieqisLLDdUeB3yDYuQPgCV14urh5BS4En59bXTgvU'}`,
  jupiter: `https://jup.ag/swap/SOL-${'4ZdhpbJJNPBHNYVGfv41DRfTytjrb6Yg5P4y5iuRpump'}`,
  birdeye: `https://birdeye.so/token/${'4ZdhpbJJNPBHNYVGfv41DRfTytjrb6Yg5P4y5iuRpump'}?chain=solana`,
  dexscreener: `https://dexscreener.com/solana/${'4ZdhpbJJNPBHNYVGfv41DRfTytjrb6Yg5P4y5iuRpump'}`,
} as const

export const SOCIAL = {
  twitter: '',     // fill when available
  telegram: '',    // fill when available
  pumpfunComments: `https://pump.fun/coin/${'4ZdhpbJJNPBHNYVGfv41DRfTytjrb6Yg5P4y5iuRpump'}`,
  github: '',      // fill if repo goes public
} as const

export const MILESTONES_USD = [5_000, 10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000] as const

export const POLL_MS = 30_000
export const POLL_JITTER_MS = 3_000
