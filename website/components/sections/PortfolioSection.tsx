'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './PortfolioSection.module.css'

const images = [
  '/images/annie-spratt-QckxruozjRg-unsplash.jpg',
  '/images/pexels-alesiakozik-6771899.jpg',
  '/images/pexels-alper-tufan-651927958-34032677.jpg',
  '/images/pexels-alphatradezone-5831251.jpg',
  '/images/pexels-blue-8562969.jpg',
  '/images/pexels-blue-8562970.jpg',
  '/images/pexels-blue-8562972.jpg',
  '/images/pexels-egorkomarov-27141311.jpg',
  '/images/pexels-karola-g-7680467.jpg',
  '/images/pexels-mizunokozuki-13801650.jpg',
]

export default function PortfolioSection() {
  const flowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !flowRef.current) return

    const totalWidth = images.length * 100 - 20

    // 横向滚动动画
    const container = flowRef.current.parentElement
    if (!container) return

    const scrollTween = gsap.to(flowRef.current, {
      x: () => -(totalWidth - 100) + 'vw',
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: () => '+=' + (totalWidth * 4) + 'vw',
        scrub: 4,
        pin: true,
        anticipatePin: 1,
        pinSpacing: true,
      },
    })

    // 图片淡入淡出效果
    flowRef.current.querySelectorAll(`.${styles.imageWrapper}`).forEach((imgWrapper: Element, index: number) => {
      const img = imgWrapper as HTMLElement
      if (index === 0) return
      
      gsap.fromTo(img, 
        { opacity: 0.5, scale: 0.92 },
        {
          opacity: 1,
          scale: 1,
          scrollTrigger: {
            trigger: img,
            start: 'left 80%',
            end: 'center center',
            scrub: true,
          },
        }
      )
    })

    return () => {
      scrollTween.kill()
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <section id="portfolio" className={styles.section}>
      <div className={styles.gradient} />
      <div className={styles.stickyContainer}>
        <div
          ref={flowRef}
          className={styles.flow}
          style={{ width: `${images.length * 100 - 20}vw` }}
        >
          {images.map((src, index) => (
            <div key={index} className={styles.imageItem}>
              <div
                className={styles.imageWrapper}
                style={{
                  opacity: index === 0 ? 1 : 0.5,
                  transform: `scale(${index === 0 ? 1 : 0.92})`,
                }}
              >
                <Image
                  src={src}
                  alt={`Portfolio ${index + 1}`}
                  width={1200}
                  height={900}
                  className={styles.image}
                  style={{ height: '75vh', width: 'auto', maxWidth: '75vw' }}
                  priority={index === 0}
                  sizes="75vw"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}