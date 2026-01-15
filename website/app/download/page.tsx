import Link from 'next/link'
import '../globals.css'

export default function DownloadPage() {
  return (
    <div className="page-root">
      <header className="download-layout-header">
        <div className="download-hero">
          <div className="section-kicker">Download</div>
          <h1 className="download-hero-title">Download Stock Trading Simulator</h1>
          <p className="section-description">
            Choose a platform build, or work directly from source. All distributions share the same
            core simulation engine.
          </p>
        </div>
      </header>

      <main className="shell">
        <section className="section">
          <div className="section-header">
            <div>
              <div className="section-kicker">Binaries</div>
              <div className="section-title">Platform builds</div>
            </div>
            <p className="section-description">
              The links below are placeholders. Point them to your GitHub Releases or any hosting
              you prefer once builds are published.
            </p>
          </div>

          <div className="download-grid">
            <div className="download-card">
              <div className="download-card-title">Windows</div>
              <div className="download-card-meta">Windows 10 or later</div>
              <Link href="#" className="button-primary">
                Download for Windows (.exe)
              </Link>
              <div className="download-card-footer">
                If SmartScreen warns about an unknown publisher, choose &quot;More info&quot; and
                confirm if you trust the source.
              </div>
            </div>

            <div className="download-card">
              <div className="download-card-title">macOS</div>
              <div className="download-card-meta">macOS 10.14 or later</div>
              <Link href="#" className="button-primary">
                Download for macOS (.app or .zip)
              </Link>
              <div className="download-card-footer">
                On first launch, you may need to open via Finder context menu to bypass Gatekeeper.
              </div>
            </div>

            <div className="download-card">
              <div className="download-card-title">Linux</div>
              <div className="download-card-meta">Most modern distributions</div>
              <Link href="#" className="button-primary">
                Download for Linux
              </Link>
              <div className="download-card-footer">
                Remember to mark the file as executable before running it from the terminal.
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <div>
              <div className="section-kicker">Install</div>
              <div className="section-title">High-level installation steps</div>
            </div>
          </div>

          <div className="card-grid">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Windows</div>
              </div>
              <div className="card-body">
                <ol>
                  <li>Download the installer (.exe).</li>
                  <li>Double-click to start the installation.</li>
                  <li>Follow the prompts to complete setup.</li>
                  <li>Launch from the Start Menu or desktop shortcut.</li>
                </ol>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">macOS</div>
              </div>
              <div className="card-body">
                <ol>
                  <li>Download the .app bundle or .zip file.</li>
                  <li>If needed, extract the archive.</li>
                  <li>Move the app into the Applications folder.</li>
                  <li>Right-click and choose &quot;Open&quot; on first launch.</li>
                </ol>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Linux</div>
              </div>
              <div className="card-body">
                <ol>
                  <li>Download the Linux executable.</li>
                  <li>Mark it as executable in your terminal.</li>
                  <li>Run the binary from the directory where it resides.</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <div>
              <div className="section-kicker">From source</div>
              <div className="section-title">Running the Python project directly</div>
            </div>
            <p className="section-description">
              If you prefer to work with the codebase, clone the repository and run the simulator
              from your local Python environment.
            </p>
          </div>

          <div className="code-block">
            <code>
              {`# Clone the repository
git clone https://github.com/DresdenGman/EPSILON-trading-simulator.git
cd stock-trading-simulator

# Install dependencies
pip install -r requirements.txt

# Run the application
python mock.py`}
            </code>
          </div>
        </section>

        <div className="back-link">
          <Link href="/" className="button-secondary">
            Back to home
          </Link>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div>© 2024 Stock Trading Simulator. MIT licensed.</div>
          <div className="footer-links">
            <a
              href="https://github.com/DresdenGman/EPSILON-trading-simulator"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
