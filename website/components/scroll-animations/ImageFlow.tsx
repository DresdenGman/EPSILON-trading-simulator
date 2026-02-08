'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface ImageFlowProps {
  images: Array<{ src: string; alt: string }>
  className?: string
}

export function ImageFlow({ images, className = '' }: ImageFlowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imagesRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      // 创建横向滚动的图片流
      const totalWidth = images.length * 100 // 每张图片占100vw
      
      gsap.to(containerRef.current, {
        x: () => `-${totalWidth - 100}vw`,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: () => `+=${totalWidth}vw`,
          scrub: true,
          pin: true,
        },
      })

      // 每张图片的淡入淡出效果
      images.forEach((_, index) => {
        const image = imagesRef.current[index]
        if (!image) return

        ScrollTrigger.create({
          trigger: image,
          start: 'left right',
          end: 'right left',
          onEnter: () => {
            gsap.to(image, {
              opacity: 1,
              scale: 1,
              duration: 0.5,
            })
          },
          onLeave: () => {
            gsap.to(image, {
              opacity: 0.3,
              scale: 0.95,
              duration: 0.5,
            })
          },
          onEnterBack: () => {
            gsap.to(image, {
              opacity: 1,
              scale: 1,
              duration: 0.5,
            })
          },
          onLeaveBack: () => {
            gsap.to(image, {
              opacity: 0.3,
              scale: 0.95,
              duration: 0.5,
            })
          },
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [images])

  return (
    <div
      ref={containerRef}
      className={`flex ${className}`}
      style={{ width: `${images.length * 100}vw` }}
    >
      {images.map((image, index) => (
        <div
          key={index}
          ref={(el) => {
            imagesRef.current[index] = el
          }}
          className="relative h-screen w-screen flex-shrink-0"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover opacity-30 scale-95"
            priority={index === 0}
            sizes="100vw"
          />
        </div>
      ))}
    </div>
  )
}
