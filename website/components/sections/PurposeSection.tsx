'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './PurposeSection.module.css'

const purposeLines = [
  { type: 'line', text: 'EPSILON', className: '' },
  { type: 'highlight', text: 'Invests', className: 'highlight' },
  { type: 'line', text: 'Evaluates', className: '' },
  { type: 'line', text: 'Performs', className: 'light' },
]

const purposeContent = [
  'In the most valuable, promising, and resilient assets. The concept of "value" at EPSILON is fundamentally multidimensional.',
  'Assets not only for their immediate financial potential but also for their ability to innovate, adapt agilely to market evolutions, and sustain long-term growth, even in volatile economic environments.',
  'By maximizing every investment opportunity, EPSILON builds a portfolio of assets that not only withstand fluctuations but capitalize on the most promising opportunities on a global scale.',
]

export default function PurposeSection() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const elements = document.querySelectorAll('#purpose .reveal-text')
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

  return (
    <section id="purpose" className={styles.section}>
      <div className={styles.background}>
        <Image
          src="/images/pexels-alphatradezone-5831251.jpg"
          alt="Purpose background"
          fill
          className={styles.backgroundImage}
        />
      </div>

      <div className={styles.content}>
        <h2 className={styles.title}>
          {purposeLines.map((line, index) => (
            <span key={index} className={styles[line.className]}>
              {line.text}
              <br />
            </span>
          ))}
        </h2>
        {purposeContent.map((text, index) => (
          <p key={index} className={`${styles.paragraph} reveal-text`}>
            {text}
          </p>
        ))}
      </div>
    </section>
  )
}