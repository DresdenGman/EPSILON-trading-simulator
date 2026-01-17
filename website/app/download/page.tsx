import Link from 'next/link'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200">
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-[#303030] bg-black/60 backdrop-blur-lg">
        <div className="epsilon-shell py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 overflow-hidden rounded-sm border border-epsilon-gold/60 bg-black/60 epsilon-gold-glow">
                <span className="flex h-full w-full items-center justify-center font-mono text-[10px] text-epsilon-gold">ε</span>
              </div>
              <span className="font-mono text-sm font-semibold tracking-epsilon text-epsilon-gold">EPSILON</span>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm" className="text-xs">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="epsilon-shell space-y-16 py-12">
        {/* Hero */}
        <section className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-label text-gray-500">Download</p>
            <h1 className="mt-1 text-3xl font-medium text-gray-100 md:text-4xl">Download Stock Trading Simulator</h1>
            <p className="mt-2 max-w-2xl text-sm font-light tracking-body text-gray-400">
              Choose a platform build, or work directly from source. All distributions share the same
              core simulation engine.
            </p>
          </div>
        </section>

        {/* Platform Builds */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-label text-gray-500">Binaries</p>
            <h2 className="mt-1 text-lg font-medium text-gray-100">Platform builds</h2>
            <p className="mt-2 max-w-xl text-xs font-light tracking-body text-gray-400">
              The links below are placeholders. Point them to your GitHub Releases or any hosting
              you prefer once builds are published.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="transition-all duration-epsilon ease-epsilon hover:border-epsilon-gold/50 hover:bg-[#121212]">
              <CardHeader>
                <CardTitle className="text-epsilon-gold">Windows</CardTitle>
                <p className="mt-1 text-[11px] font-normal text-gray-500">Windows 10 or later</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="#">
                  <Button variant="primary" size="md" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download for Windows (.exe)
                  </Button>
                </Link>
                <p className="text-[10px] font-normal text-gray-500">
                  If SmartScreen warns about an unknown publisher, choose &quot;More info&quot; and
                  confirm if you trust the source.
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-epsilon ease-epsilon hover:border-epsilon-gold/50 hover:bg-[#121212]">
              <CardHeader>
                <CardTitle className="text-epsilon-gold">macOS</CardTitle>
                <p className="mt-1 text-[11px] font-normal text-gray-500">macOS 10.14 or later</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="#">
                  <Button variant="primary" size="md" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download for macOS (.app or .zip)
                  </Button>
                </Link>
                <p className="text-[10px] font-normal text-gray-500">
                  On first launch, you may need to open via Finder context menu to bypass Gatekeeper.
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-epsilon ease-epsilon hover:border-epsilon-gold/50 hover:bg-[#121212]">
              <CardHeader>
                <CardTitle className="text-epsilon-gold">Linux</CardTitle>
                <p className="mt-1 text-[11px] font-normal text-gray-500">Most modern distributions</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="#">
                  <Button variant="primary" size="md" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download for Linux
                  </Button>
                </Link>
                <p className="text-[10px] font-normal text-gray-500">
                  Remember to mark the file as executable before running it from the terminal.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Installation Steps */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-label text-gray-500">Install</p>
            <h2 className="mt-1 text-lg font-medium text-gray-100">High-level installation steps</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-[#282828]">
              <CardHeader>
                <CardTitle className="text-epsilon-gold">Windows</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-1.5 text-[11px] font-light text-gray-300 leading-relaxed">
                  <li>1. Download the installer (.exe).</li>
                  <li>2. Double-click to start the installation.</li>
                  <li>3. Follow the prompts to complete setup.</li>
                  <li>4. Launch from the Start Menu or desktop shortcut.</li>
                </ol>
              </CardContent>
            </Card>

            <Card className="border-[#282828]">
              <CardHeader>
                <CardTitle className="text-epsilon-gold">macOS</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-1.5 text-[11px] font-light text-gray-300 leading-relaxed">
                  <li>1. Download the .app bundle or .zip file.</li>
                  <li>2. If needed, extract the archive.</li>
                  <li>3. Move the app into the Applications folder.</li>
                  <li>4. Right-click and choose &quot;Open&quot; on first launch.</li>
                </ol>
              </CardContent>
            </Card>

            <Card className="border-[#282828]">
              <CardHeader>
                <CardTitle className="text-epsilon-gold">Linux</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-1.5 text-[11px] font-light text-gray-300 leading-relaxed">
                  <li>1. Download the Linux executable.</li>
                  <li>2. Mark it as executable in your terminal.</li>
                  <li>3. Run the binary from the directory where it resides.</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* From Source */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-label text-gray-500">From source</p>
            <h2 className="mt-1 text-lg font-medium text-gray-100">Running the Python project directly</h2>
            <p className="mt-2 max-w-xl text-xs font-light tracking-body text-gray-400">
              If you prefer to work with the codebase, clone the repository and run the simulator
              from your local Python environment.
            </p>
          </div>

          <Card className="border-[#282828] bg-[#050505]">
            <CardContent className="pt-4">
              <pre className="overflow-x-auto font-mono text-[11px] font-normal text-gray-300 leading-relaxed">
                <code>{`# Clone the repository
git clone https://github.com/DresdenGman/EPSILON-trading-simulator.git
cd stock-trading-simulator

# Install dependencies
pip install -r requirements.txt

# Run the application
python mock.py`}</code>
              </pre>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#303030] bg-black/70 mt-16">
        <div className="epsilon-shell flex flex-col items-start justify-between gap-2 py-4 text-[11px] font-normal text-gray-500 md:flex-row md:items-center">
          <span>© 2026 EPSILON LABS · Team Approcher</span>
          <div className="flex gap-4">
            <a
              href="https://github.com/DresdenGman/EPSILON-trading-simulator"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-epsilon ease-epsilon hover:text-gray-200"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
