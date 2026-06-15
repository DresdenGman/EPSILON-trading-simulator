import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'EPSILON | Stock Trading Simulator',
    template: '%s | EPSILON',
  },
  description:
    'EPSILON is an institutional-grade stock trading simulator and quantitative education platform. Master trading with real-time data, advanced analytics, and risk management tools.',
  keywords: ['stock trading', 'trading simulator', 'quantitative trading', 'investment education', 'risk management', 'technical analysis'],
  authors: [{ name: 'Dresden E. Goehner' }],
  creator: 'Dresden E. Goehner',
  publisher: 'EPSILON',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://epsilon-trading.com',
    siteName: 'EPSILON',
    title: 'EPSILON | Stock Trading Simulator',
    description: 'Institutional-grade stock trading simulator for the next generation of quants.',
    images: [{ url: '/screenshots/main_interface.png', width: 1200, height: 900, alt: 'EPSILON Interface' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EPSILON | Stock Trading Simulator',
    description: 'Institutional-grade stock trading simulator for quantitative trading education.',
    images: ['/screenshots/main_interface.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="epsilon">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans antialiased`}>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#111620',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#D8DEE9',
              fontSize: '13px',
            },
          }}
        />
      </body>
    </html>
  )
}
