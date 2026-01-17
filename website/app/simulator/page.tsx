'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BarChart2, Database, LineChart, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const chartData = [
  { date: '09:30', open: 185.2, high: 186.1, low: 184.9, close: 185.9 },
  { date: '10:00', open: 185.9, high: 187.0, low: 185.5, close: 186.7 },
  { date: '10:30', open: 186.7, high: 187.4, low: 186.1, close: 187.1 },
  { date: '11:00', open: 187.1, high: 187.8, low: 186.8, close: 187.4 },
  { date: '11:30', open: 187.4, high: 188.0, low: 187.0, close: 187.8 },
  { date: '13:00', open: 187.8, high: 188.5, low: 187.3, close: 188.2 },
  { date: '14:00', open: 188.2, high: 188.9, low: 187.7, close: 188.7 },
  { date: '15:00', open: 188.7, high: 189.2, low: 188.1, close: 189.0 },
]

const logLines = [
  '[09:30:01] Session initialized · account: STUDENT-001',
  '[09:30:15] Loaded universe: AAPL, MSFT, NVDA, SPY',
  '[09:31:02] Backtest started · strategy: mean_reversion_v2',
  '[09:31:07] Order submitted · BUY 100 AAPL @ MKT',
  '[09:31:07] Risk check passed · exposure within limits',
  '[09:31:07] Order executed · BUY 100 AAPL @ 185.92',
  '[09:45:12] Equity curve updated · new high watermark',
  '[10:12:43] AI rating updated · portfolio quality: A+',
]

export default function SimulatorPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="flex w-16 flex-col items-center border-r border-[#303030] bg-[#050505] py-4 text-gray-500">
          <div className="mb-6 flex h-8 w-8 items-center justify-center border border-epsilon-gold/70 bg-black/60 epsilon-inset-shadow-gold">
            <span className="text-[10px] font-mono font-semibold text-epsilon-gold">ε</span>
          </div>
          <nav className="mt-2 flex flex-col gap-5 text-xs">
            <button className="flex h-8 w-8 items-center justify-center bg-[#121212] text-epsilon-gold epsilon-inset-shadow transition-all duration-280 ease-out-slow hover:bg-[#141414]">
              <LineChart className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center border border-transparent transition-all duration-280 ease-out-slow hover:border-[#404040] hover:bg-[#121212]">
              <BarChart2 className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center border border-transparent transition-all duration-280 ease-out-slow hover:border-[#404040] hover:bg-[#121212]">
              <Database className="h-4 w-4" />
            </button>
            <button className="mt-auto flex h-8 w-8 items-center justify-center border border-transparent transition-all duration-280 ease-out-slow hover:border-[#404040] hover:bg-[#121212]">
              <Settings className="h-4 w-4" />
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          {/* Top bar */}
          <header className="border-b border-[#303030] bg-[#0A0A0A] px-5 py-3 epsilon-inset-shadow">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-6">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-normal uppercase tracking-normal text-gray-500">
                    Total Equity
                  </p>
                  <p className="font-mono text-sm font-semibold text-epsilon-gold">$ 100,000.00</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-normal uppercase tracking-normal text-gray-500">
                    Daily P&amp;L
                  </p>
                  <p className="font-mono text-sm font-semibold text-success-soft">+ $ 1,240.50</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-normal uppercase tracking-normal text-gray-500">
                    Buying Power
                  </p>
                  <p className="font-mono text-sm font-semibold text-gray-200">$ 200,000.00</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="border border-[#282828] bg-[#101010] px-3 py-1.5 text-[11px] font-light text-gray-300 epsilon-inset-shadow">
                  <span className="font-mono text-xs font-semibold text-epsilon-gold">Sharpe 2.1</span>
                  <span className="mx-2 text-gray-500">|</span>
                  <span className="font-mono text-xs font-semibold text-danger-soft">Drawdown -4.5%</span>
                </div>
                <span className="text-[10px] font-light text-gray-500">SIMULATOR · REAL DATA MODE</span>
              </div>
            </div>
          </header>

          {/* Workspace grid */}
          <div className="grid flex-1 grid-cols-[minmax(0,2.4fr)_minmax(0,1.1fr)] gap-4 bg-[#050505] p-4">
            {/* Left column: chart + logs */}
            <div className="flex flex-col gap-4">
              <Card className="flex-1 border-[#282828] bg-[#0B0B0B]">
                <CardHeader className="flex items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-xs font-medium text-gray-100">AAPL · 5m Candles</CardTitle>
                    <p className="mt-1 text-[10px] font-light text-gray-500">
                      Demo data · For layout illustration only
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="px-2 text-[10px]">
                      1D
                    </Button>
                    <Button size="sm" variant="ghost" className="px-2 text-[10px]">
                      5D
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      className="px-2 text-[10px] font-mono epsilon-gold-glow"
                    >
                      1M
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="h-64 border-t border-[#282828] pt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="epsilonGold" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#C5A059" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#C5A059" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        stroke="#1A1A1A"
                        strokeDasharray="3 3"
                        horizontal={true}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        stroke="#404040"
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                      />
                      <YAxis
                        stroke="#404040"
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                        domain={['dataMin - 1', 'dataMax + 1']}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#0B0B0B',
                          border: '1px solid #282828',
                          borderRadius: 2,
                          fontSize: 10,
                        }}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="close"
                        stroke="#C5A059"
                        strokeWidth={1.5}
                        fill="url(#epsilonGold)"
                        dot={false}
                        activeDot={{ r: 3, fill: '#C5A059' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="h-40 border-[#282828] bg-[#050505]">
                <CardHeader className="flex items-center justify-between pb-1">
                  <CardTitle className="text-[11px] font-medium text-gray-300">Event Log</CardTitle>
                  <span className="font-mono text-[10px] font-light text-gray-500">stdout · simulator</span>
                </CardHeader>
                <CardContent className="h-28 overflow-hidden border-t border-[#282828] bg-[#050505] px-3 py-2">
                  <div className="h-full overflow-y-auto font-mono text-[10px] font-light leading-relaxed text-gray-400">
                    {logLines.map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column: order entry + AI box */}
            <div className="flex flex-col gap-4">
              <Card className="border-[#282828] bg-[#0B0B0B]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-gray-100">Order Entry</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 border-t border-[#282828] pt-3 text-[11px]">
                  <div className="grid grid-cols-[1.4fr_1fr] gap-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-normal uppercase tracking-normal text-gray-500">
                        Symbol
                      </label>
                      <input
                        className="h-7 w-full border border-[#282828] bg-[#050505] px-2 font-mono text-[11px] font-light text-gray-100 outline-none transition-all duration-280 ease-out-slow focus:border-epsilon-gold epsilon-inset-shadow"
                        defaultValue="AAPL"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-normal uppercase tracking-normal text-gray-500">
                        Quantity
                      </label>
                      <input
                        className="h-7 w-full border border-[#282828] bg-[#050505] px-2 font-mono text-[11px] font-light text-gray-100 outline-none transition-all duration-280 ease-out-slow focus:border-epsilon-gold epsilon-inset-shadow"
                        defaultValue="100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-[1.4fr_1fr] gap-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-normal uppercase tracking-normal text-gray-500">
                        Limit Price
                      </label>
                      <input
                        className="h-7 w-full border border-[#282828] bg-[#050505] px-2 font-mono text-[11px] font-light text-gray-100 outline-none transition-all duration-280 ease-out-slow focus:border-epsilon-gold epsilon-inset-shadow"
                        defaultValue="188.20"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-normal uppercase tracking-normal text-gray-500">
                        Mode
                      </label>
                      <select className="h-7 w-full border border-[#282828] bg-[#050505] px-2 text-[11px] font-light text-gray-100 outline-none transition-all duration-280 ease-out-slow focus:border-epsilon-gold epsilon-inset-shadow">
                        <option>Real Data · Online</option>
                        <option>Mock Data · Offline</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="success"
                      size="lg"
                      className="flex-1 text-[11px] font-semibold"
                    >
                      Buy
                    </Button>
                    <Button
                      variant="destructive"
                      size="lg"
                      className="flex-1 text-[11px] font-semibold"
                    >
                      Sell
                    </Button>
                  </div>
                  <p className="text-[10px] font-light text-gray-500">
                    Orders in EPSILON never leave this machine. Use it to train decision-making,
                    not to send real capital.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-[#282828] bg-[#0B0B0B]">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-xs font-medium text-gray-100">
                    AI Risk Co-Pilot
                    <span className="border border-epsilon-gold/60 bg-[#17130a]/50 px-2 py-0.5 font-mono text-[10px] font-semibold text-epsilon-gold epsilon-inset-shadow-gold">
                      Rating · A+
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 border-t border-[#282828] pt-3 text-[11px] font-light leading-relaxed text-gray-300">
                  <p>
                    Current position and proposed order keep total exposure inside your configured
                    risk envelope. Max drawdown for this path is within acceptable bounds.
                  </p>
                  <ul className="list-disc pl-4 text-[11px] font-light text-gray-400">
                    <li>Position size &lt; 2% of equity per trade.</li>
                    <li>Portfolio-level volatility trending down over last 10 sessions.</li>
                    <li>No single-name exposure above 15% of total risk budget.</li>
                  </ul>
                  <p className="pt-1 text-[10px] font-light text-gray-500">
                    This is a deterministic, local model — tuned for education, not prediction.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

