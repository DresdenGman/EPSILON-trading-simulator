'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './ContactSection.module.css'

export default function ContactSection() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const elements = document.querySelectorAll('#contact .reveal-text')
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
    <section id="contact" className={styles.section}>
      <div className={styles.background}>
        <Image
          src="/images/pexels-karola-g-7680467.jpg"
          alt="Contact background"
          fill
          className={styles.backgroundImage}
        />
      </div>

      <div className={`${styles.content} ${styles.contentCenter}`}>
        <h2 className={styles.title}>Contact</h2>
        <p className={`${styles.text} reveal-text`}>
          Share your vision with us.
        </p>
        <p className={`${styles.text} reveal-text`}>
          Together, let&apos;s explore how to transform your ideas into tangible opportunities.
        </p>
        <div className={`${styles.contactInfo} reveal-text`}>
          <p className={styles.info}>
            <strong>Email:</strong> dresdengoehner@gmail.com
          </p>
          <p className={styles.info}>
            <strong>Created by:</strong> Dresden E. Goehner
          </p>
        </div>
      </div>
    </section>
  )
}