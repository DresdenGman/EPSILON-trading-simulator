'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface TextRevealProps {
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  className?: string
}

export function TextReveal({
  children,
  direction = 'up',
  delay = 0,
  className = '',
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const directions = {
      up: { y: 50, x: 0 },
      down: { y: -50, x: 0 },
      left: { y: 0, x: 50 },
      right: { y: 0, x: -50 },
    }

    const from = directions[direction]

    // 设置初始状态
    gsap.set(ref.current, {
      opacity: 0,
      ...from,
    })

    const animation = gsap.to(
      ref.current,
      {
        opacity: 1,
        y: 0,
        x: 0,
        duration: 1,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          end: 'top 50%',
          scrub: 1,
          markers: false, // 设置为 true 可以看到触发点
        },
      }
    )

    return () => {
      animation.kill()
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === ref.current) {
          trigger.kill()
        }
      })
    }
  }, [direction, delay])

  return (
    <div 
      ref={ref} 
      className={className}
      style={{ opacity: 0 }}
    >
      {children}
    </div>
  )
}
