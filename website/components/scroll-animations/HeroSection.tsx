'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface HeroSectionProps {
  title: string
  subtitle?: string
  description?: string
  backgroundImage?: string
  className?: string
}

export function HeroSection({
  title,
  subtitle,
  description,
  backgroundImage,
  className = '',
}: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // 标题从中心放大淡入
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          {
            scale: 0.8,
            opacity: 0,
            y: 50,
          },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          }
        )
      }

      // 副标题从下方滑入
      if (subtitleRef.current) {
        gsap.fromTo(
          subtitleRef.current,
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.3,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          }
        )
      }

      // 描述文字淡入
      if (descriptionRef.current) {
        gsap.fromTo(
          descriptionRef.current,
          {
            opacity: 0,
            y: 20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          }
        )
      }

      // 背景图片视差效果
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          scale: 1.2,
          y: (i, el) => {
            return ScrollTrigger.maxScroll(window) * 0.3
          },
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* 背景图片 */}
      {backgroundImage && (
        <div
          ref={imageRef}
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80" />
        </div>
      )}

      {/* 内容 */}
      <div className="relative z-10 max-w-4xl px-8 text-center">
        <h1
          ref={titleRef}
          className="mb-6 text-6xl font-bold text-white md:text-8xl lg:text-9xl"
        >
          {title}
        </h1>
        {subtitle && (
          <p
            ref={subtitleRef}
            className="mb-4 text-xl text-gray-300 md:text-2xl"
          >
            {subtitle}
          </p>
        )}
        {description && (
          <p
            ref={descriptionRef}
            className="text-base text-gray-400 md:text-lg"
          >
            {description}
          </p>
        )}
      </div>
    </section>
  )
}
