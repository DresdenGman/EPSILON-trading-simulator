import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  metadataBase: new URL('https://epsilon-trading.com'),
  applicationName: 'EPSILON Quantitative Decision Lab',
  title: {
    default: 'EPSILON | Quantitative Decision Laboratory',
    template: '%s | EPSILON',
  },
  description:
    'Build a market idea, test it, and try to break it. EPSILON is a quantitative decision lab for falsifiable hypotheses, transparent evidence, and disciplined retesting.',
  keywords: ['quantitative research', 'decision science', 'backtesting', 'market simulation', 'falsifiable hypothesis', 'research reproducibility', 'data provenance'],
  authors: [{ name: 'Dresden E. Goehner' }],
  creator: 'Dresden E. Goehner',
  publisher: 'EPSILON',
  alternates: { canonical: '/landing' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://epsilon-trading.com',
    siteName: 'EPSILON',
    title: 'EPSILON | Quantitative Decision Laboratory',
    description: 'Build a market idea, test it, and try to break it through one transparent research cycle.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EPSILON | Quantitative Decision Laboratory',
    description: 'Build a market idea, test it, and try to break it through one transparent research cycle.',
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
      <body className="font-sans antialiased">
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
