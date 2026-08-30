import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'EPSILON Quantitative Evidence Instrument',
  title: {
    default: 'EPSILON | Quantitative Evidence Instrument',
    template: '%s | EPSILON',
  },
  description:
    'Do not trust one backtest line. EPSILON maps how a quantitative claim behaves when costs, timing, and universe assumptions are perturbed independently.',
  keywords: ['quantitative research', 'decision science', 'backtesting', 'market simulation', 'falsifiable hypothesis', 'research reproducibility', 'data provenance'],
  authors: [{ name: 'Dresden E. Goehner' }],
  creator: 'Dresden E. Goehner',
  publisher: 'EPSILON',
  alternates: { canonical: '/landing' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'EPSILON',
    title: 'EPSILON | Quantitative Evidence Instrument',
    description: 'Do not trust the line. Test its neighborhood through transparent, falsifiable perturbation evidence.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EPSILON | Quantitative Evidence Instrument',
    description: 'Do not trust the line. Test its neighborhood through transparent, falsifiable perturbation evidence.',
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
        <a href="#main-content" className="sr-only fixed left-4 top-4 z-[100] rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-content focus:not-sr-only">Skip to main content</a>
        <div id="main-content" tabIndex={-1}>{children}</div>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#101217',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#F0EFEA',
              fontSize: '13px',
            },
          }}
        />
      </body>
    </html>
  )
}
