'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './ContentSection.module.css'

interface ContentSectionProps {
  id: string
  title?: string
  children: React.ReactNode
  backgroundImage?: string
  invertGradient?: boolean
}

export default function ContentSection({
  id,
  title,
  children,
  backgroundImage,
  invertGradient = false,
}: ContentSectionProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const elements = document.querySelectorAll(`#${id} .reveal-text`)
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
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger?.toString().includes(id)) {
          trigger.kill()
        }
      })
    }
  }, [id])

  const gradientClass = invertGradient
    ? 'from-white via-white to-gray-50'
    : 'from-gray-50 to-white'

  return (
    <section
      id={id}
      className={`${styles.section} ${styles[gradientClass]}`}
    >
      {backgroundImage && (
        <div className={styles.background}>
          <Image
            src={backgroundImage}
            alt={`${id} background`}
            fill
            className={styles.backgroundImage}
          />
        </div>
      )}

      <div className={styles.content}>
        {title && <h2 className={styles.title}>{title}</h2>}
        <div className={styles.body}>{children}</div>
      </div>
    </section>
  )
}