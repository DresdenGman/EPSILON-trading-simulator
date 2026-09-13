'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register the ScrollTrigger plugin.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface ScrollSectionProps {
  children: ReactNode
  className?: string
  id?: string
}

export function ScrollSection({ children, className = '', id }: ScrollSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    // Refresh ScrollTrigger to calculate positions correctly.
    ScrollTrigger.refresh()
  }, [])

  return (
    <section ref={sectionRef} id={id} className={className}>
      {children}
    </section>
  )
}
