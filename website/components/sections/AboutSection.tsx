'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './AboutSection.module.css'

const aboutContent = [
  { type: 'name', text: 'Dresden E. Goehner', strong: true },
  { type: 'text', text: 'Creator of EPSILON Stock Trading Simulator' },
  { type: 'text', text: 'EPSILON embodies a central promise. A promise which, in reality, is a declaration of intent: to provide only the most valuable, the most promising and the most resilient trading education experience.' },
  { type: 'text', text: 'EPSILON is a privacy-first, institutional-grade trading simulator built for the next generation of quants. Our platform combines real-time market data, advanced analytics, and comprehensive risk management tools to create an unparalleled educational experience.' },
  { type: 'text', text: 'By focusing on companies and technologies transforming the digital landscape, EPSILON identifies solutions capable of addressing contemporary challenges and generating significant and sustainable returns.' },
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