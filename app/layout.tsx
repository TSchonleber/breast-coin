import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { BackgroundVideo } from '@/components/BackgroundVideo'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Breast.coin — a memecoin with a heart of pink',
  description:
    '99% of every $BREAST trade routes to the National Breast Cancer Foundation, on-chain, in real time.',
  metadataBase: new URL('https://breast-coin.vercel.app'),
  openGraph: {
    title: 'Breast.coin — a memecoin with a heart of pink',
    description:
      '99% of every $BREAST trade routes to the National Breast Cancer Foundation, on-chain, in real time.',
    url: 'https://breast-coin.vercel.app',
    siteName: 'Breast.coin',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Breast.coin — a memecoin with a heart of pink',
    description:
      '99% of every $BREAST trade routes to the National Breast Cancer Foundation, on-chain, in real time.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans text-ink antialiased">
        <BackgroundVideo />
        {children}
      </body>
    </html>
  )
}
