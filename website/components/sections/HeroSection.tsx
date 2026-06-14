'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './HeroSection.module.css'

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

interface HeroSectionProps {
  isScrolling: boolean
}

export default function HeroSection({ isScrolling }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const imageFlowRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const autoScrollRef = useRef<gsap.core.Tween | null>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !sectionRef.current) return

    const section = sectionRef.current
    
    // 初始化 CSS 变量
    section.style.setProperty('--bgsProgress', '1')
    section.style.setProperty('--bgEndProgress', '0')

    // Hero 文字动画
    if (titleRef.current) {
      gsap.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
      })
    }

    if (textRef.current) {
      gsap.to(textRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.3,
        ease: 'power2.out',
      })
    }

    // 自动滚动逻辑
    const startAutoScroll = () => {
      if (autoScrollRef.current || !section) return

      const currentProgress = parseFloat(section.style.getPropertyValue('--bgsProgress') || '1')
      const step = 0.02
      const nextProgress = currentProgress <= 0 ? 1 : currentProgress - step

      autoScrollRef.current = gsap.to(section, {
        '--bgsProgress': nextProgress,
        duration: 4,
        ease: 'power1.inOut',
        onComplete: () => {
          if (!isScrolling && window.scrollY < window.innerHeight * 0.8 && section) {
            const finalProgress = parseFloat(section.style.getPropertyValue('--bgsProgress') || '0')
            if (finalProgress <= 0) {
              section.style.setProperty('--bgsProgress', '1')
            }
            autoScrollRef.current = null
            scrollTimeoutRef.current = setTimeout(() => {
              if (!isScrolling && window.scrollY < window.innerHeight * 0.8) {
                startAutoScroll()
              }
            }, 200)
          } else {
            autoScrollRef.current = null
          }
        },
      })
    }

    // 启动自动滚动
    if (window.scrollY < window.innerHeight * 0.8) {
      startAutoScroll()
    }

    // ScrollTrigger 用于滚动时的背景切换
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        const progress = 1 - self.progress
        section.style.setProperty('--bgsProgress', String(progress))
        section.style.setProperty('--bgEndProgress', String(self.progress))
      },
    })

    // Hero 内容淡出效果
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        const fadeProgress = Math.min(self.progress * 1.5, 1)
        if (titleRef.current) {
          gsap.to(titleRef.current, {
            opacity: 1 - fadeProgress * 0.5,
            y: fadeProgress * 30,
            duration: 0.3,
          })
        }
        if (textRef.current) {
          gsap.to(textRef.current, {
            opacity: 1 - fadeProgress * 0.5,
            y: fadeProgress * 20,
            duration: 0.3,
          })
        }
      },
    })

    return () => {
      if (autoScrollRef.current) {
        autoScrollRef.current.kill()
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [isScrolling])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className={styles.hero}
      style={{ '--bgsProgress': 1, '--bgEndProgress': 0 } as React.CSSProperties}
    >
      {/* 背景层 */}
      <div className={styles.backgroundLayer}>
        <div
          className={styles.backgroundStart}
          style={{ opacity: 'var(--bgsProgress)' }}
        >
          <div
            ref={imageFlowRef}
            className={styles.imageFlow}
            style={{ width: `${images.length * 100}vw` }}
          >
            {images.slice(0, Math.ceil(images.length / 2)).map((src, index) => (
              <div key={`start-${index}`} className={styles.imageWrapper}>
                <Image
                  src={src}
                  alt={`Hero background ${index + 1}`}
                  fill
                  className={styles.image}
                  priority={index === 0}
                  sizes="100vw"
                />
              </div>
            ))}
          </div>
        </div>

        <div
          className={styles.backgroundEnd}
          style={{ opacity: 'var(--bgEndProgress)' }}
        >
          <div className={styles.imageFlow} style={{ width: `${images.length * 100}vw` }}>
            {images.slice(Math.ceil(images.length / 2)).map((src, index) => (
              <div key={`end-${index}`} className={styles.imageWrapper}>
                <Image
                  src={src}
                  alt={`Hero background ${index + 1}`}
                  fill
                  className={styles.image}
                  sizes="100vw"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 内容层 */}
      <div className={styles.content}>
        <h1
          ref={titleRef}
          className={styles.title}
          style={{ opacity: 0, transform: 'translateY(50px)' }}
          data-split="words"
        >
          Valuable, that is
          <br />
          <span className={styles.titleHighlight}>
            <span className={styles.textBlue}>our</span>
            <br />
            <span>future.</span>
          </span>
        </h1>
        <p
          ref={textRef}
          className={styles.subtitle}
          style={{ opacity: 0, transform: 'translateY(30px)' }}
          data-split="words"
        >
          EPSILON is a stock trading simulator built around a central promise: 
          to provide the most valuable, promising, and resilient trading education experience.
        </p>
      </div>
    </section>
  )
}