import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Lock,
  Gamepad2,
  Download,
  FileText,
  BarChart3,
  Shield,
  Zap,
  Database,
  Code,
  Users,
  Target,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VideoPlayer } from '@/components/video-player'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200">
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-[#222] bg-black/70 backdrop-blur-md">
        <div className="epsilon-shell py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 overflow-hidden rounded-sm border border-epsilon-gold bg-black/60">
                <Image src="/epsilon-logo.png" alt="EPSILON logo" width={28} height={28} className="h-full w-full object-cover" />
              </div>
              <span className="font-mono text-sm tracking-[0.35em] text-epsilon-gold">EPSILON</span>
            </div>
            <nav className="hidden items-center gap-7 text-xs text-gray-400 md:flex">
              <Link href="#features" className="hover:text-gray-200">
                Features
              </Link>
              <Link href="#demo" className="hover:text-gray-200">
                Demo
              </Link>
              <Link href="#business" className="hover:text-gray-200">
                Business Plan
              </Link>
              <Link href="#download" className="hover:text-gray-200">
                Download
              </Link>
              <Button variant="primary" size="sm" className="ml-2 px-4 py-1 text-xs font-semibold">
                Get Started
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="epsilon-shell space-y-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-sm border border-[#222] bg-gradient-to-b from-[#101010] to-[#050505] p-8 md:p-10">
          <div className="pointer-events-none absolute inset-0 epsilon-grid-background opacity-40" />
          <div className="pointer-events-none absolute inset-x-16 top-0 h-32 bg-gradient-to-b from-epsilon-gold/15 via-transparent to-transparent" />

          <div className="relative grid gap-10 md:grid-cols-[1.4fr_minmax(0,1fr)]">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-sm border border-[#333] bg-black/60 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-gray-400">
                Quantitative Education
              </p>
              <h1 className="mb-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                The Future of Quantitative Education.
              </h1>
              <p className="max-w-xl text-sm text-gray-400">
                Don&apos;t just predict the future. Engineer the tools to navigate it. EPSILON is a
                privacy-first, institutional-grade trading simulator built for the next generation of
                quants. Connect to real market data when online, or run fully offline with high-quality
                mock data — your choice, your control.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button variant="primary" size="lg" className="epsilon-gold-glow text-xs">
                  Download Simulator
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
                <Button variant="outline" size="lg" className="text-xs">
                  View Documentation
                </Button>
                <span className="ml-1 text-[11px] text-gray-500">
                  Real data when online. Mock data when offline. All processing stays local.
                </span>
              </div>
            </div>

            {/* Hero right: video with fullscreen */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-md overflow-hidden rounded-sm border border-[#333] bg-black/80">
                <div className="absolute inset-0 epsilon-grid-background opacity-25" />
                <div className="relative z-10 h-56 w-full border-b border-[#333]">
                  <VideoPlayer
                    src="/epsilon-intro.mp4"
                    className="h-full w-full"
                  />
                </div>
                <div className="relative z-10 flex items-center justify-between px-3 py-2 text-[11px] text-gray-400">
                  <span className="font-mono text-xs text-epsilon-gold">Diamond Challenge · Demo</span>
                  <span>Approcher Team · EPSILON LABS</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Statement / Hook */}
        <section id="problem" className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Context</h2>
              <p className="mt-1 text-lg font-medium text-gray-100">The Financial Literacy Paradox</p>
            </div>
            <p className="max-w-md text-xs text-gray-400">
              Students are told to &quot;invest early&quot;, then pushed toward gamified apps or locked out
              of institutional tools. EPSILON sits exactly between those two extremes.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-4 md:grid-rows-2">
            <Card className="md:col-span-2 md:row-span-2 border-danger-soft/60 bg-[#121212]">
              <CardHeader>
                <CardTitle className="text-danger-soft/90 text-[11px] uppercase tracking-[0.2em]">
                  Retail Reality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-3xl text-danger-soft">90 / 90 / 90</p>
                <p className="mt-2 text-xs text-gray-300">
                  90% of retail traders lose 90% of their capital in 90 days. Not because they are
                  incapable, but because their tools are misaligned with their goals.
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border-[#333] bg-[#101010]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gray-400">
                  <Gamepad2 className="h-3.5 w-3.5 text-gray-500" />
                  Gamified Apps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-300">When trading looks like a game, people play.</p>
                <p className="mt-1 text-[11px] text-gray-500">
                  Swipe-to-trade interfaces reward frequency, not discipline. EPSILON deliberately slows
                  you down.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#333] bg-[#101010]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gray-400">
                  <Lock className="h-3.5 w-3.5 text-gray-500" />
                  Institutional Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-lg text-gray-200">$24k / year</p>
                <p className="mt-1 text-[11px] text-gray-500">
                  Professional terminals are priced for funds, not for classrooms or independent
                  learners.
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border-epsilon-gold/70 bg-[#14110a]">
              <CardHeader>
                <CardTitle className="text-[11px] uppercase tracking-[0.2em] text-epsilon-gold">
                  EPSILON
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xl text-epsilon-gold">Professional · Local-first · Free</p>
                <p className="mt-2 text-xs text-gray-200">
                  Institutional-grade metrics, deterministic backtests, and AI risk scoring — delivered
                  as a desktop simulator, not a brokerage.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="space-y-6">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Architecture</h2>
            <p className="mt-1 text-lg font-medium text-gray-100">Designed for classrooms and labs.</p>
            <p className="mt-2 max-w-xl text-xs text-gray-400">
              EPSILON supports two modes: real market data (via akshare) when online, or pure mock data
              for offline use. All trade history, models, and P&amp;L stay on the student&apos;s machine
              — universities can distribute binaries, integrate with coursework, and never send orders or
              positions to external servers.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-2 lg:col-span-3 border-epsilon-gold/30 bg-[#0F0F0F]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-epsilon-gold">
                  <Database className="h-4 w-4" />
                  Dual-mode Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-sm border border-epsilon-gold/20 bg-black/30 p-3">
                    <p className="mb-2 text-xs font-semibold text-epsilon-gold">Real Data Mode</p>
                    <p className="text-[11px] text-gray-300">
                      Connect to live market data via akshare API when online. Perfect for backtesting
                      with historical accuracy. Supports real-time price feeds and historical OHLC data.
                    </p>
                  </div>
                  <div className="rounded-sm border border-epsilon-gold/20 bg-black/30 p-3">
                    <p className="mb-2 text-xs font-semibold text-epsilon-gold">Mock Data Mode</p>
                    <p className="text-[11px] text-gray-300">
                      Generate high-quality synthetic data for offline use. Ideal for classrooms without
                      internet or when exploring hypothetical scenarios. Fully deterministic and
                      reproducible.
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[10px] text-gray-500">
                  Switch modes anytime. All processing stays local — your data never leaves your machine.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-epsilon-gold" />
                  Privacy-first
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-gray-400">
                  All trade history, models, and P&amp;L stay on your machine — never sent to external
                  servers, regardless of data mode. Your alpha stays yours.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-epsilon-gold" />
                  Institutional Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-gray-400">
                  Move beyond raw P&amp;L. Track Sharpe ratio, alpha, max drawdown, hit-rate, profit
                  factor, and CAGR for every strategy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-epsilon-gold" />
                  AI Co-Pilot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-gray-400">
                  Every order receives an automated risk score. Students learn to reason about risk before
                  pressing &quot;send&quot;.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Detailed Features Grid */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Capabilities</h2>
            <p className="mt-1 text-lg font-medium text-gray-100">What EPSILON Can Do</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-[11px] text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>Market orders with configurable slippage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>Limit orders with price triggers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>Stop-loss and take-profit orders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>Pending order management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Portfolio Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-[11px] text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>Real-time equity curve visualization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>K-line candlestick charts (60-day)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>Position-level P&amp;L tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>Trade history export</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Risk Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-[11px] text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>Auto stop-loss triggers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>Scale in/out rules</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>Configurable trading costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>Portfolio diversification tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Data &amp; Backtesting</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-[11px] text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>Historical date navigation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>Custom stock universe management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>Event simulation (good/bad news)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>Deterministic replay</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-[11px] text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>Total Return &amp; CAGR</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>Sharpe Ratio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>Maximum Drawdown</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>Win Rate &amp; Profit Factor</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Educational Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-[11px] text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>No account required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>Local-first architecture</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>Export analysis reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                    <span>Cross-platform support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="space-y-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Demo</h2>
            <p className="mt-1 text-lg font-medium text-gray-100">See EPSILON in Action</p>
            <p className="mt-2 max-w-xl text-xs text-gray-400">
              Explore the simulator interface in your browser, or download the full desktop application
              for the complete experience.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-epsilon-gold/40 bg-[#0F0F0F]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-epsilon-gold" />
                  Interactive Demo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-[11px] text-gray-400">
                  Experience the full simulator interface directly in your browser. All features are
                  functional — place orders, view charts, and analyze performance metrics.
                </p>
                <Link href="/simulator">
                  <Button variant="primary" size="md" className="w-full">
                    Launch Simulator Demo
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-epsilon-gold/40 bg-[#0F0F0F]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-epsilon-gold" />
                  Video Walkthrough
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-[11px] text-gray-400">
                  Watch our introduction video to see EPSILON&apos;s key features and understand how it
                  fits into quantitative education.
                </p>
                <div className="rounded-sm border border-[#333] bg-black/50 overflow-hidden">
                  <div className="h-40 w-full">
                    <VideoPlayer src="/epsilon-intro.mp4" className="h-full w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Business Plan Section */}
        <section id="business" className="space-y-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
              Diamond Challenge
            </h2>
            <p className="mt-1 text-lg font-medium text-gray-100">Business Plan</p>
            <p className="mt-2 max-w-xl text-xs text-gray-400">
              Our comprehensive business plan outlines EPSILON&apos;s market opportunity, product
              strategy, and go-to-market approach for the Diamond Challenge competition.
            </p>
          </div>

          <Card className="border-epsilon-gold/50 bg-gradient-to-br from-[#0F0F0F] to-[#14110a]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-epsilon-gold">
                <FileText className="h-5 w-5" />
                EPSILON Business Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <div className="space-y-3">
                  <p className="text-sm text-gray-300">
                    Download our complete business plan document to learn about EPSILON&apos;s vision,
                    market analysis, competitive positioning, and growth strategy.
                  </p>
                  <ul className="space-y-1.5 text-[11px] text-gray-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                      <span>Market opportunity and target audience analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                      <span>Product features and competitive advantages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                      <span>Go-to-market strategy and distribution channels</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-epsilon-gold" />
                      <span>Financial projections and sustainability model</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="rounded-sm border border-epsilon-gold/30 bg-black/50 p-6 text-center">
                    <FileText className="mx-auto h-12 w-12 text-epsilon-gold/60" />
                    <p className="mt-2 text-xs text-gray-400">PDF Document</p>
                    <p className="text-[10px] text-gray-500">603 KB</p>
                  </div>
                  <a href="/epsilon-business-plan.pdf" download>
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full epsilon-gold-glow"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Business Plan
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Social Proof */}
        <section className="epsilon-mesh rounded-sm border border-[#333] bg-[#111111] px-6 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
            Trusted by the Approcher Community
          </p>
          <p className="mt-2 text-sm text-gray-100">In our pilot study of 50 student traders:</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-sm border border-[#333] bg-black/50 px-3 py-2">
              <div className="font-mono text-xl text-epsilon-gold">82%</div>
              <p className="mt-1 text-[11px] text-gray-400">
                demanded repeatable, automated backtesting — not screenshots of P&amp;L.
              </p>
            </div>
            <div className="rounded-sm border border-[#333] bg-black/50 px-3 py-2">
              <div className="font-mono text-xl text-epsilon-gold">#1</div>
              <p className="mt-1 text-[11px] text-gray-400">
                requested feature was AI-driven risk scoring for each trade.
              </p>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-gray-500">
            EPSILON is our answer: a simulator that feels like a terminal, not a casino.
          </p>
        </section>

        {/* Use Cases */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Use Cases</h2>
            <p className="mt-1 text-lg font-medium text-gray-100">Who Benefits from EPSILON</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-epsilon-gold" />
                  Students &amp; Learners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-gray-400">
                  Practice trading strategies without risking real money. Learn risk management,
                  portfolio theory, and quantitative analysis in a safe, controlled environment.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-epsilon-gold" />
                  Educators &amp; Institutions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-gray-400">
                  Integrate EPSILON into finance, economics, or computer science curricula. Distribute
                  custom datasets and track student progress without external dependencies.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-epsilon-gold" />
                  Independent Researchers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-gray-400">
                  Test trading algorithms and strategies with institutional-grade metrics. Keep your
                  research private and reproducible without expensive terminal subscriptions.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Download / CTA */}
        <section
          id="download"
          className="rounded-sm border border-epsilon-gold/40 bg-[#121212] px-6 py-6 epsilon-gold-glow/0"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-epsilon-gold">
                Diamond Challenge · EPSILON Simulator
              </p>
              <p className="mt-1 text-sm text-gray-100">
                Download the current build or explore the simulator layout in your browser.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/simulator">
                <Button variant="primary" size="md">
                  View Simulator Demo
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
              <a
                href="https://github.com/DresdenGman/EPSILON-trading-simulator"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="md"
                  className="border-epsilon-gold/60 text-epsilon-gold"
                >
                  View on GitHub
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222] bg-black/90">
        <div className="epsilon-shell flex flex-col items-start justify-between gap-2 py-4 text-[11px] text-gray-500 md:flex-row md:items-center">
          <span>© 2026 EPSILON LABS · Team Approcher</span>
          <div className="flex gap-4">
            <a
              href="https://github.com/DresdenGman/EPSILON-trading-simulator"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-200"
            >
              GitHub
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-200">
              Discord
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-200">
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
