import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ImpactTracker } from '../components/impact-tracker';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://epsilonfield.space'),
  title: { default: 'EPSILON — Quantitative Evidence Instrument', template: '%s · EPSILON' },
  description: 'Test whether a market conclusion survives nearby changes in costs, timing, and universe assumptions.',
  applicationName: 'EPSILON',
  authors: [{ name: 'Dresden E. Goehner' }],
  creator: 'Dresden E. Goehner',
  category: 'quantitative research',
  alternates: { canonical: '/' },
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website', url: '/', siteName: 'EPSILON',
    title: 'EPSILON — Test the neighborhood',
    description: 'A quantitative evidence instrument for challenging conclusions, not decorating them.',
    images: [{ url: '/og.png', width: 1672, height: 941, alt: 'EPSILON perturbation field' }],
  },
  twitter: {
    card: 'summary_large_image', title: 'EPSILON — Test the neighborhood',
    description: 'Challenge a market claim with atomic and joint assumption stresses.', images: ['/og.png'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ImpactTracker />
        {children}
      </body>
    </html>
  );
}
