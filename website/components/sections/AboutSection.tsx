'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './AboutSection.module.css'

const aboutContent = [
  { type: 'name', text: 'Dresden E. Goehner', strong: true },
  { type: 'text', text: 'Creator of EPSILON Stock Trading Simulator' },
  { type: 'text', text: 'EPSILON is a quantitative decision lab for turning a market idea into an explicit, falsifiable experiment.' },
  { type: 'text', text: 'The product keeps hypotheses, submitted configurations, computed evidence, provenance gaps, and retest state visible instead of presenting a simulation as proof.' },
  { type: 'text', text: 'It is an educational research environment using simulated or explicitly identified evidence. It does not promise returns or provide financial advice.' },
]

export default function AboutSection() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const elements = document.querySelectorAll('#about .reveal-text')
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
    <section id="about" className={styles.section}>
      <div className={styles.background}>
        <Image
          src="/images/pexels-alesiakozik-6771899.jpg"
          alt="About background"
          fill
          className={styles.backgroundImage}
        />
      </div>

      <div className={styles.content}>
        <h2 className={styles.title}>About</h2>
        <div className={styles.body}>
          {aboutContent.map((item, index) => (
            <p
              key={index}
              className={`${styles[item.type]} reveal-text`}
            >
              {item.strong ? <strong>{item.text}</strong> : item.text}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
