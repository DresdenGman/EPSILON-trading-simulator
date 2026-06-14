'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './DownloadSection.module.css'

const features = [
  { title: 'Real-time Trading', description: 'Experience real-time market data and trading simulation with institutional-grade tools. Access live market feeds, execute trades, and analyze performance in real-time.' },
  { title: 'Risk Management', description: 'Learn to manage risk with advanced analytics and automated risk scoring. Monitor portfolio exposure, set stop-loss limits, and optimize risk-return ratios.' },
  { title: 'Quantitative Analysis', description: 'Leverage powerful quantitative tools to analyze market trends, identify patterns, and develop data-driven trading strategies.' },
  { title: 'Educational Resources', description: 'Access comprehensive educational materials, tutorials, and interactive guides to master the art of quantitative trading.' },
]

const downloads = [
  { platform: 'macOS', emoji: '🍎', status: 'coming-soon' },
  { platform: 'Windows', emoji: '🪟', status: 'coming-soon' },
  { platform: 'Linux', emoji: '🐧', status: 'coming-soon' },
]

export default function DownloadSection() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const elements = document.querySelectorAll('#features .reveal-text, #downloads .reveal-text, #interface .reveal-text')
    elements.forEach((el) => {
      const element = el as HTMLElement
      element.style.setProperty('--revealProgress', '0')

      gsap.to(element, {
        '--revealProgress': 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 90%',
          end: 'top 40%',
          scrub: 1.5,
        },
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  const handleDownload = (platform: string) => {
    alert(`${platform} version coming soon!`)
  }

  return (
    <>
      {/* Features Section */}
      <section id="features" className={styles.sectionGradient}>
        <div className={styles.background}>
          <Image
            src="/images/pexels-blue-8562972.jpg"
            alt="Features background"
            fill
            className={styles.backgroundImage}
          />
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>Features</h2>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className="reveal-text">
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interface Section */}
      <section id="interface" className={styles.sectionWhite}>
        <div className={styles.background}>
          <Image
            src="/images/pexels-tabtrader-com-app-180445110-24709181.jpg"
            alt="Interface background"
            fill
            className={styles.backgroundImage}
          />
        </div>

        <div className={styles.content}>
          <h2 className={`${styles.title} ${styles.titleCenter}`}>Interface</h2>
          <div className={styles.interfaceGrid}>
            <div className="reveal-text">
              <div className={styles.interfaceImage}>
                <Image
                  src="/screenshots/main_interface.png"
                  alt="EPSILON Interface"
                  fill
                  className={styles.screenshot}
                />
              </div>
            </div>
            <div className="reveal-text">
              <h3 className={styles.featureTitle}>Intuitive Design</h3>
              <p className={styles.featureDesc}>
                EPSILON features a clean, intuitive interface designed for both beginners and experienced traders.
                Navigate seamlessly through real-time data, charts, and analytics.
              </p>
              <p className={styles.featureDesc}>
                Our interface prioritizes clarity and efficiency, allowing you to focus on what matters most:
                making informed trading decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Downloads Section */}
      <section id="downloads" className={styles.sectionGradient}>
        <div className={styles.background}>
          <Image
            src="/images/pexels-egorkomarov-27141311.jpg"
            alt="Downloads background"
            fill
            className={styles.backgroundImage}
          />
        </div>

        <div className={`${styles.content} ${styles.contentCenter}`}>
          <h2 className={styles.title}>Downloads</h2>

          <div className="reveal-text">
            <h3 className={styles.featureTitle}>Business Plan</h3>
            <a
              href="/epsilon-business-plan.pdf"
              download
              className={styles.downloadButton}
            >
              Download Business Plan (PDF)
            </a>
          </div>

          <div className="reveal-text">
            <h3 className={styles.featureTitle}>Introduction Video</h3>
            <div className={styles.videoWrapper}>
              <video controls className={styles.video} poster="/images/pexels-alesiakozik-6771899.jpg">
                <source src="/epsilon-intro.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          <div className="reveal-text">
            <h3 className={styles.featureTitle}>Download Application</h3>
            <div className={styles.platformsGrid}>
              {downloads.map((item) => (
                <button
                  key={item.platform}
                  onClick={() => handleDownload(item.platform)}
                  className={styles.platformCard}
                >
                  <div className={styles.emoji}>{item.emoji}</div>
                  <div className={styles.platformName}>{item.platform}</div>
                  <div className={styles.platformStatus}>Coming Soon</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}