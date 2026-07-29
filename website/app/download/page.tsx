// Import Next.js built-in Link component for client-side navigation between pages (avoids full page reloads)
import Link from 'next/link'

// Import desktop OS related icon components from lucide-react icon library for UI visual cues
import { Download, Monitor, Apple, Terminal } from 'lucide-react'

// Import shadcn/ui reusable Button component with pre-built variant styles for interactive buttons
import { Button } from '@/components/ui/button'

// Import shadcn/ui Card composite components to build grouped content card layouts for download & install sections
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * DownloadPage Page Component
 * Primary purpose: Dedicated download landing page for the EPSILON Stock Trading Simulator desktop application
 * Features included:
 * 1. Sticky navigation header with brand logo and home page return button
 * 2. Hero introductory section explaining the download purpose
 * 3. Three platform download cards: Windows / macOS / Linux with download buttons & security notes
 * 4. Step-by-step installation guides for each operating system
 * 5. Source code running instructions for developers who want to launch via Python locally
 * 6. Page footer with copyright statement and official GitHub repository link
 * Styling tech stack: Tailwind CSS for all responsive layout, dark theme color scheme optimized for trading software aesthetic
 */
export default function DownloadPage() {
  return (
    // Root page container: full minimum viewport height, pure black background base, light gray text for dark mode readability
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200">
      {/* 
        Site Header Navigation Bar
        Sticky fixed to top of viewport, always visible during vertical scrolling
        Backdrop blur + semi-transparent black background for glassmorphism dark UI effect
        Border bottom to visually separate header from main page content
      */}
      <header className="sticky top-0 z-30 border-b border-[#303030] bg-black/60 backdrop-blur-lg">
        {/* Container wrapper with custom site max-width class: epsilon-shell, controls page content width & horizontal padding */}
        <div className="epsilon-shell py-3">
          {/* Flex container to horizontally align brand logo section and home back button on opposite sides */}
          <div className="flex items-center justify-between">
            {/* Brand logo + title link: navigates user back to website homepage when clicked */}
            <Link href="/" className="flex items-center gap-2">
              {/* Custom rounded logo badge with gold border, inner inset shadow decorative styling */}
              <div className="h-7 w-7 overflow-hidden rounded-sm border border-epsilon-gold/70 bg-black/60 epsilon-inset-shadow-gold">
                {/* Greek epsilon symbol centered inside logo container, monospace gold text */}
                <span className="flex h-full w-full items-center justify-center font-mono text-[10px] text-epsilon-gold">ε</span>
              </div>
              {/* Main brand display name: EPSILON, monospace font with letter spacing, gold accent color */}
              <span className="font-mono text-sm font-semibold tracking-wide text-epsilon-gold">EPSILON</span>
            </Link>

            {/* Navigation link back to homepage using ghost styled button (no background fill) */}
            <Link href="/">
              <Button variant="ghost" size="sm">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main page content wrapper */}
      <main className="epsilon-shell space-y-20 py-12">
        {/* Hero Intro Section: Page headline, title & descriptive paragraph */}
        <section className="space-y-4">
          <div>
            {/* Small uppercase category label to denote current page section */}
            <p className="text-xs font-medium uppercase tracking-normal text-gray-500">Download</p>
            {/* Primary page main heading, responsive font size scaling for mobile / desktop screens */}
            <h1 className="mt-2 text-3xl font-medium text-gray-100 md:text-4xl">
              Download Stock Trading Simulator
            </h1>
            {/* Supporting descriptive text explaining download options and core engine consistency across platforms */}
            <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-gray-400">
              Choose a platform build, or work directly from source. All distributions share the same
              core simulation engine.
            </p>
          </div>
        </section>

        {/* Platform Binary Download Cards Section */}
        <section className="space-y-6">
          {/* Section header area with category tag, subheading and placeholder link note */}
          <div>
            <p className="text-xs font-medium uppercase tracking-normal text-gray-500">Binaries</p>
            <h2 className="mt-2 text-lg font-medium text-gray-100">Platform builds</h2>
            <p className="mt-2 text-xs font-light text-gray-400">
              The links below are placeholders. Point them to your GitHub Releases or any hosting
              you prefer once builds are published.
            </p>
          </div>

          {/* Responsive grid layout: single column on mobile, 3 equal columns on medium screen sizes and above */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Windows Download Card Component */}
            <Card className="border-[#282828] bg-[#101010]">
              {/* Card header containing OS icon, title and minimum system requirement text */}
              <CardHeader>
                <div className="flex items-center gap-3">
                  {/* Windows desktop monitor system icon */}
                  <Monitor className="h-5 w-5 text-gray-300" />
                  <CardTitle className="text-sm">Windows</CardTitle>
                </div>
                {/* Minimum supported Windows OS version specification */}
                <p className="mt-1 text-[11px] font-light text-gray-500">Windows 10 or later</p>
              </CardHeader>
              {/* Card main content area: download button + SmartScreen security warning explanation */}
              <CardContent className="space-y-4">
                {/* Anchor wrapper for download button (href="#" temporary placeholder link) */}
                <Link href="#" className="block">
                  <Button variant="primary" size="lg" className="w-full">
                    {/* Download icon positioned left of button text */}
                    <Download className="mr-2 h-4 w-4" />
                    Download for Windows (.exe)
                  </Button>
                </Link>
                {/* Small footnote explaining Windows Defender SmartScreen security popup workaround */}
                <p className="text-[10px] font-light leading-relaxed text-gray-500">
                  If SmartScreen warns about an unknown publisher, choose &quot;More info&quot; and
                  confirm if you trust the source.
                </p>
              </CardContent>
            </Card>

            {/* macOS Download Card Component */}
            <Card className="border-[#282828] bg-[#101010]">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {/* Apple macOS brand icon */}
                  <Apple className="h-5 w-5 text-gray-300" />
                  <CardTitle className="text-sm">macOS</CardTitle>
                </div>
                {/* Minimum supported macOS operating system version */}
                <p className="mt-1 text-[11px] font-light text-gray-500">macOS 10.14 or later</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="#" className="block">
                  <Button variant="primary" size="lg" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download for macOS
                  </Button>
                </Link>
                {/* Guidance text to bypass macOS Gatekeeper security restriction on first application launch */}
                <p className="text-[10px] font-light leading-relaxed text-gray-500">
                  On first launch, you may need to open via Finder context menu to bypass Gatekeeper.
                </p>
              </CardContent>
            </Card>

            {/* Linux Download Card Component */}
            <Card className="border-[#282828] bg-[#101010]">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {/* Terminal icon representing Linux command line environment */}
                  <Terminal className="h-5 w-5 text-gray-300" />
                  <CardTitle className="text-sm">Linux</CardTitle>
                </div>
                {/* Compatibility note for mainstream Linux distributions */}
                <p className="mt-1 text-[11px] font-light text-gray-500">Most modern distributions</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="#" className="block">
                  <Button variant="primary" size="lg" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download for Linux
                  </Button>
                </Link>
                {/* Instruction reminding users to set executable file permission via Linux terminal */}
                <p className="text-[10px] font-light leading-relaxed text-gray-500">
                  Remember to mark the file as executable before running it from the terminal.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Step-by-Step Installation Guide Section for each OS */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-normal text-gray-500">Install</p>
            <h2 className="mt-2 text-lg font-medium text-gray-100">High-level installation steps</h2>
          </div>

          {/* Responsive 3-column grid layout for installation step cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Windows Installation Steps Card */}
            <Card className="border-[#282828] bg-[#0F0F0F]">
              <CardHeader>
                {/* OS title highlighted with brand gold accent color */}
                <CardTitle className="text-sm font-medium uppercase tracking-normal text-epsilon-gold">Windows</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Ordered list detailing sequential installation workflow */}
                <ol className="space-y-2 text-xs font-light leading-relaxed text-gray-300">
                  <li>1. Download the installer (.exe).</li>
                  <li>2. Double-click to start the installation.</li>
                  <li>3. Follow the prompts to complete setup.</li>
                  <li>4. Launch from the Start Menu or desktop shortcut.</li>
                </ol>
              </CardContent>
            </Card>

            {/* macOS Installation Steps Card */}
            <Card className="border-[#282828] bg-[#0F0F0F]">
              <CardHeader>
                <CardTitle className="text-sm font-medium uppercase tracking-normal text-epsilon-gold">macOS</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-xs font-light leading-relaxed text-gray-300">
                  <li>1. Download the .app bundle or .zip file.</li>
                  <li>2. If needed, extract the archive.</li>
                  <li>3. Move the app into the Applications folder.</li>
                  <li>4. Right-click and choose &quot;Open&quot; on first launch.</li>
                </ol>
              </CardContent>
            </Card>

            {/* Linux Installation Steps Card */}
            <Card className="border-[#282828] bg-[#0F0F0F]">
              <CardHeader>
                <CardTitle className="text-sm font-medium uppercase tracking-normal text-epsilon-gold">Linux</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-xs font-light leading-relaxed text-gray-300">
                  <li>1. Download the Linux executable.</li>
                  <li>2. Mark it as executable in your terminal.</li>
                  <li>3. Run the binary from the directory where it resides.</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Source Code Build & Run Section for Developers */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-normal text-gray-500">From source</p>
            <h2 className="mt-2 text-lg font-medium text-gray-100">Running the Python project directly</h2>
            {/* Description for developers who prefer local source code execution instead of precompiled binaries */}
            <p className="mt-2 text-xs font-light leading-relaxed text-gray-400">
              If you prefer to work with the codebase, clone the repository and run the simulator
              from your local Python environment.
            </p>
          </div>

          {/* Code block card displaying terminal shell commands */}
          <Card className="border-[#282828] bg-[#050505]">
            <CardContent className="p-6">
              {/* Preformatted text block for monospace terminal command styling */}
              <pre className="font-mono text-[11px] font-light leading-relaxed text-gray-300">
                {/* Inline code snippet: git clone, dependency install & app launch shell commands */}
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

      {/* Page Footer Area: Copyright information + external GitHub repository link */}
      <footer className="border-t border-[#303030] bg-black/80">
        <div className="epsilon-shell flex flex-col items-start justify-between gap-3 py-6 text-[11px] font-light text-gray-500 md:flex-row md:items-center">
          {/* Copyright statement with fixed year and brand entity names */}
          <span>© 2026 EPSILON LABS · Team Approcher</span>
          {/* Link container for external website navigation */}
          <div className="flex gap-5">
            {/* External GitHub link, opens in new browser tab with security rel attributes */}
            <a
              href="https://github.com/DresdenGman/EPSILON-trading-simulator"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-280 ease-out-slow hover:text-gray-200"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
